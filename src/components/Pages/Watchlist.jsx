import Navbar from "../Sections/Navbar";
import { auth } from '../../firebaseConfig';
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user is logged in');
          return;
        }

        console.log('Fetching watchlist for UID:', user.uid);

        const q = query(
          collection(db, 'watchlist'),
          where('uid', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);

        console.log('Query snapshot:', querySnapshot);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map(doc => doc.data());
          console.log('Data from Firestore:', data);
          setWatchlist(data[0]); // Assuming there's only one document per user
        } else {
          console.log('No matching documents found.');
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  const handleCheckboxChange = async (key) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user is logged in');
        return;
      }

      const q = query(
        collection(db, 'watchlist'),
        where('uid', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const updatedList = { ...watchlist.list };
        delete updatedList[key];

        await updateDoc(docRef, { list: updatedList });
        setWatchlist(prevWatchlist => ({
          ...prevWatchlist,
          list: updatedList
        }));
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!watchlist) {
    return <div>No watchlist found.</div>;
  }

  return (
    <>
      <Navbar />
      <div style={{ color: "white" }}>
        <h2>Watchlist</h2>
        <p><strong>UID:</strong> {watchlist.uid}</p>
        <p><strong>Username:</strong> {watchlist.username}</p>

        <table style={{ width: '95%', margin: 'auto 4rem', color: 'white' }}>
          <thead style={{ border: '1px solid white' }}>
            <tr style={{ border: '1px solid white', textAlign: 'left' }}>
              <th>Remove</th> {/* Checkbox for removal */}
              <th>Poster</th>
              <th>Title</th>
              <th>Genres</th>
              <th>Rating</th>
              <th>Watch</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(watchlist.list || {}).map((key) => (
              <tr key={key} style={{ borderBottom: '1px solid white', textAlign: 'left' }}>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(key)}
                  />
                </td>
                <td>
                  <img 
                    src={watchlist.list[key][1]} 
                    alt={key} 
                    style={{ width: '12rem', objectFit: 'cover' }} 
                  />
                </td>
                <td>
                  <strong>{key}</strong>
                </td>
                <td>
                  {watchlist.list[key][3].split(',').map((genre, i) => (
                    <div key={i}>{genre.trim()}</div>
                  ))}
                </td>
                <td>
                  {watchlist.list[key][4] / 10}
                </td>
                <td>
                  <a href={watchlist.list[key][0]} target="_blank" rel="noopener noreferrer">
                    <button>
                      Watch {key}
                    </button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Watchlist;
