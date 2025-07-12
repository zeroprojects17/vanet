import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import f_app from './firebaseConfig.js'; // Adjust the import path as needed
import { Logout } from './auth.jsx';


const db = getDatabase(f_app);

const TrafficInterface = () => {
  // State to hold the system status, fetched from Firebase
  const [systemStatus, setSystemStatus] = useState({
    road1EV: "NO",
    road2EV: "NO",
    road1EV_ESP: "NO",
    road2EV_ESP: "NO",
    road1EV_green_timer: 0,
    road2EV_green_timer: 0,
    trafficlight1: { red: 0, yellow: 0, green: 0 },
    trafficlight2: { red: 0, yellow: 0, green: 0 },
    last_log: "",
    last_update: ""
  });

  // State to manage the current control mode (automatic or manual)
  // This state will be synchronized with Firebase.
  const [mode, setMode] = useState("automatic"); // Default to automatic, will be overridden by Firebase

  // useEffect hook to subscribe to Firebase Realtime Database changes
  // This runs once on component mount to set up listeners.
  useEffect(() => {
    // Define all the Firebase paths we want to listen to
    const paths = [
      'road1EV', 'road2EV',
      'road1EV_ESP', 'road2EV_ESP',
      'road1EV_green_timer', 'road2EV_green_timer',
      'trafficlight1_red', 'trafficlight1_yellow', 'trafficlight1_green',
      'trafficlight2_red', 'trafficlight2_yellow', 'trafficlight2_green',
      'last_log', 'last_update',
      'mode' // Add 'mode' to the paths to listen for changes
    ];

    // Map over the paths and set up an onValue listener for each
    const unsubscribeFunctions = paths.map(path => {
      const dbRef = ref(db, path); // Get a reference to the specific database path
      return onValue(dbRef, (snapshot) => {
        const value = snapshot.val(); // Get the current value at the path
        setSystemStatus(prev => {
          // Handle traffic light specific updates
          if (path.includes('trafficlight1_')) {
            const color = path.split('_')[1];
            return {
              ...prev,
              trafficlight1: { ...prev.trafficlight1, [color]: value }
            };
          } else if (path.includes('trafficlight2_')) {
            const color = path.split('_')[1];
            return {
              ...prev,
              trafficlight2: { ...prev.trafficlight2, [color]: value }
            };
          } else if (path === 'mode') {
            // If the path is 'mode', update the local 'mode' state
            setMode(value);
            return prev; // No change to systemStatus for 'mode'
          } else {
            // For all other paths, update the corresponding systemStatus property
            return { ...prev, [path]: value };
          }
        });
      });
    });

    // Cleanup function: unsubscribe from all listeners when the component unmounts
    return () => unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  }, []); // Empty dependency array means this effect runs only once on mount

  // Handler to toggle the control mode between automatic and manual
  const handleToggleMode = () => {
    setMode(prev => {
      const newMode = prev === "automatic" ? "manual" : "automatic";
      // Update the 'mode' value in Firebase Realtime Database
      set(ref(db, 'mode'), newMode)
        .then(() => console.log("Mode updated successfully in Firebase:", newMode))
        .catch(error => console.error("Error updating mode in Firebase:", error));
      return newMode; // Update local state immediately for responsiveness
    });
  };

  // Function to set the state of a specific traffic light (for manual mode)
  const setTrafficLight = (road, color) => {
    const base = `trafficlight${road}_`;
    // Iterate through red, yellow, green and set the active color to 1, others to 0
    ['red', 'yellow', 'green'].forEach(c => {
      const path = base + c;
      set(ref(db, path), c === color ? 1 : 0)
        .then(() => console.log(`Traffic light ${road} set to ${color}`))
        .catch(error => console.error(`Error setting traffic light ${road} to ${color}:`, error));
    });
  };

  // TrafficLight functional component to render individual traffic lights
  const TrafficLight = ({ road, lights }) => (
    <div className="flex flex-col items-center m-5 p-5 border border-gray-300 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Road {road}</h3>
      <div className="w-20 h-56 bg-gray-800 rounded-lg flex flex-col justify-around items-center p-2">
        {/* Red light */}
        <div className="w-16 h-16 rounded-full bg-red-500 border-2 border-black"
             style={{ opacity: lights.red ? 1 : 0.3 }}></div>
        {/* Yellow light */}
        <div className="w-16 h-16 rounded-full bg-yellow-400 border-2 border-black"
             style={{ opacity: lights.yellow ? 1 : 0.3 }}></div>
        {/* Green light */}
        <div className="w-16 h-16 rounded-full bg-green-500 border-2 border-black"
             style={{ opacity: lights.green ? 1 : 0.3 }}></div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-lg">Green Timer: <span className="font-bold">{road === 1 ? systemStatus.road1EV_green_timer : systemStatus.road2EV_green_timer}s</span></p>
        <p className="text-lg">EV Priority: <span className="font-bold">{road === 1 ? systemStatus.road1EV_ESP : systemStatus.road2EV_ESP}</span></p>
      </div>

      {/* Manual control buttons, only visible if mode is 'manual' */}
      {mode === 'manual' && (
        <div className="mt-4 flex gap-3">
          {['red', 'yellow', 'green'].map(color => (
            <button key={color}
              className={`py-2 px-4 rounded-md border border-gray-300 cursor-pointer font-bold
                          ${color === 'red' ? 'bg-red-500 text-white' :
                             color === 'yellow' ? 'bg-yellow-400 text-black' :
                             'bg-green-500 text-white'}
                          hover:shadow-lg transition-shadow duration-200`}
              onClick={() => setTrafficLight(road, color)}
            >
              {color.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-5 font-inter bg-gray-50 min-h-screen rounded-lg shadow-lg">
    <Logout />
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Traffic Control System</h1>

      {/* Mode Toggle Section */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <button
          onClick={handleToggleMode}
          className={`py-3 px-6 text-lg font-semibold rounded-lg shadow-md transition-all duration-300
                      ${mode === "automatic" ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}
                      text-white border-none cursor-pointer`}
        >
          Toggle Mode
        </button>
        <span className={`text-2xl font-bold ${mode === "automatic" ? 'text-green-600' : 'text-orange-500'}`}>
          {mode === "automatic" ? "Automatic Mode" : "Manual Mode"}
        </span>
      </div>

      {/* Traffic Lights Display Section */}
      <div className="flex justify-center flex-wrap gap-8 mb-8">
        <TrafficLight road={1} lights={systemStatus.trafficlight1} />
        <TrafficLight road={2} lights={systemStatus.trafficlight2} />
      </div>

      {/* System Status Section */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">System Status</h2>
        <p className="text-lg mb-2"><strong>Last Update:</strong> <span className="text-gray-600">{systemStatus.last_update}</span></p>
        <p className="text-lg mb-4"><strong>Last Log:</strong> <span className="text-gray-600">{systemStatus.last_log}</span></p>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className={`p-3 rounded-md shadow-sm text-lg
                           ${systemStatus.road1EV === 'YES' ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
            Road 1 EV Detected: <span className="font-semibold">{systemStatus.road1EV}</span>
          </div>
          <div className={`p-3 rounded-md shadow-sm text-lg
                           ${systemStatus.road2EV === 'YES' ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
            Road 2 EV Detected: <span className="font-semibold">{systemStatus.road2EV}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficInterface;
