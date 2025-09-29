"use client"
import {useState,useEffect} from 'react'
import Link from 'next/link'

const List = () =>{
    
    const [coinLaundries,setCoinLaundries]= useState([])
    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        const fetchCoinLaundryStories = async()=>{
            const response =await fetch('/api/coinLaundry');
            const result=await response.json();
            if(result.success){
                setCoinLaundries(result.data);
            }
            setLoading(false);
        };
        fetchCoinLaundryStories();
    },[])
  
    return(
        <>
         {loading && <div>読み込み中...</div>}
        <ul>
            {coinLaundries.map(coinLaundry=>{ 
                return (
                        <li key={coinLaundry._id}>せんたくランド{coinLaundry.store}店
                            <Link href={`/coinLaundry/${coinLaundry._id}`} >もっと見る</Link>
                        </li>
                        )
            })}
        </ul>
      
        </>
    )
} 

export default List;