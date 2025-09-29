"use client"
import {useState,useEffect} from 'react'

const List = () =>{
    
    const [coinLaundries,setCoinLaundries]= useState([])
    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        const fetchCoinLaundryStories = async()=>{
            const response =await fetch('/api/coinLaundry');
            const result=await response.json();
            if(result.success){
                setCoinLaundries(result.data)
            }
        };
        fetchCoinLaundryStories();
    },[])
  
    return(
        <>
        <ul>
            {coinLaundries.map(coinLaundry=>{
                return <li key={coinLaundry._id}>{coinLaundry.store}</li>
            })}
        </ul>
      
        </>
    )
} 

export default List;