import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddPlace() {
  // const apiUrl = "https://backendplacetovisitecuador.onrender.com/places/"
  const apiUrl = "http://localhost:8080/places/";

  const [place, setPlace] = useState({
    title: "",
    description: "",
    mapsUrl: "",
    imageUrl: "",
    city: ""
  });

  const [titleAddEdit, setTitleAddEdit] = useState('Add');
  const [id, setId] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  

  useEffect(() => {
    const queryId = location.pathname.split("/")[2];
    const placeId = queryId ? parseInt(queryId, 10) : 0;
    setId(placeId);

    if(placeId!==0) {
      setTitleAddEdit('Edit');
      const fetchPlaceData = async () => {
        try {
          const response = await axios.get(apiUrl);
          if (response) {
            const places = response.data;
            const placeSearched = places.find(place => place.id === placeId);
            if (placeSearched) {
              setPlace(placeSearched);
            } else {
              console.warn('Place not found with id:', placeId);
            }
          }
          
        } catch (error) {
          console.error("Error fetching place data:", error);
        }
      };

      fetchPlaceData();
    }
  }, [location.pathname])


  

  const handleChange = (e) => {
    setPlace(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handleClick = async e => {
    e.preventDefault();
    if(titleAddEdit === 'Edit') {
      console.log('edit place', id);
      try {
        await axios.put(apiUrl + id, place);
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    } 
    // Add place
    else {
      console.log('Add place');
      try {
        await axios.post(apiUrl, place);
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    }
    
  }

  return (
    <div className='form'>
      <h1>{titleAddEdit} Place</h1>
      <div className="form-field">
        <label htmlFor="title">Title: </label>
        <input type="text" placeholder='Title' onChange={handleChange}  name= 'title' 
          value={place.title} required/>
      </div>
      <div className="form-field">
        <label htmlFor="description">Description: </label>
        <input type="text" placeholder='Description' onChange={handleChange} name='description' 
          value={place.description} required />
      </div>

      <div className="form-field">
        <label htmlFor="mapsUrl">Maps Url: </label>
        <input type="text" placeholder='Maps URL' onChange={handleChange} name='mapsUrl' 
          value={place.mapsUrl} required/>
      </div>

      <div className="form-field">
        <label htmlFor="imageUrl">Image Url: </label>
        <input type="text" placeholder='Image URL' onChange={handleChange} name='imageUrl' 
          value={place.imageUrl} required/>
      </div>

      <div className="form-field">
        <label htmlFor="city">City: </label>
        <input type="text" placeholder='City' onChange={handleChange} name='city' 
          value={place.city} required/>
      </div>

      <button onClick={handleClick}>{titleAddEdit} Place</button>
      
    </div>
  )
}
