import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AlzaSyBSend0l9xm8Bqzfdm9qC3nnF7ZTVOSrAg",
  databaseURL: "https://vanet-155c0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vanet-155c0",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const TrafficInterface = () => {
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

  useEffect(() => {
    // List of all Firebase paths we want to monitor
    const paths = [
      'road1EV',
      'road2EV',
      'road1EV_ESP',
      'road2EV_ESP',
      'road1EV_green_timer',
      'road2EV_green_timer',
      'trafficlight1_red',
      'trafficlight1_yellow',
      'trafficlight1_green',
      'trafficlight2_red',
      'trafficlight2_yellow',
      'trafficlight2_green',
      'last_log',
      'last_update'
    ];

    // Create listeners for each path
    const unsubscribeFunctions = paths.map(path => {
      const dbRef = ref(db, path);
      return onValue(dbRef, (snapshot) => {
        const value = snapshot.val();
        setSystemStatus(prev => {
          // Handle traffic light values differently
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
          } else {
            return { ...prev, [path]: value };
          }
        });
      });
    });

    // Cleanup function to remove all listeners
    return () => unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  }, []);

  const TrafficLight = ({ road, lights }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '20px',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '10px'
    }}>
      <h3>Road {road}</h3>
      <div style={{
        width: '80px',
        height: '220px',
        backgroundColor: '#333',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'red',
          opacity: lights.red ? 1 : 0.3,
          border: '2px solid #000'
        }}></div>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'yellow',
          opacity: lights.yellow ? 1 : 0.3,
          border: '2px solid #000'
        }}></div>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#7CFC00',   ////green
          opacity: lights.green ? 1 : 0.3,
          border: '2px solid #000'
        }}></div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <p>Green Timer: {road === 1 ? systemStatus.road1EV_green_timer : systemStatus.road2EV_green_timer}s</p>
        <p>EV Priority: {road === 1 ? systemStatus.road1EV_ESP : systemStatus.road2EV_ESP}</p>
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Traffic Control System</h1>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <TrafficLight road={1} lights={systemStatus.trafficlight1} />
        <TrafficLight road={2} lights={systemStatus.trafficlight2} />
      </div>
      
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px'
      }}>
        <h2>System Status</h2>
        <p><strong>Last Update:</strong> {systemStatus.last_update}</p>
        <p><strong>Last Log:</strong> {systemStatus.last_log}</p>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            padding: '10px',
            backgroundColor: systemStatus.road1EV === 'YES' ? '#ffcccc' : '#eee',
            borderRadius: '5px',
            fontWeight: systemStatus.road1EV === 'YES' ? 'bold' : 'normal'
          }}>
            Road 1 EV Detected: {systemStatus.road1EV}
          </div>
          <div style={{
            padding: '10px',
            backgroundColor: systemStatus.road2EV === 'YES' ? '#ffcccc' : '#eee',
            borderRadius: '5px',
            fontWeight: systemStatus.road2EV === 'YES' ? 'bold' : 'normal'
          }}>
            Road 2 EV Detected: {systemStatus.road2EV}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficInterface;