"use client"
import {useState,useEffect} from 'react'

const Mono = ({id}) =>{
    const [coinLaundry,setCoinLaundry]= useState()
    const [status,setStatus]=useState("pending")

    useEffect(()=>{
        const fetchCoinLaundryStore = async()=>{
            try{    
                const response =await fetch('/api/coinLaundry');

                if(!response.ok){
                    throw new Error('ネットワークにエラーが起きました')
                }
                const result=await response.json();
                if(result.success){
                    const findCoinLaundry = result.data.find(coinLaundry => coinLaundry._id === id)
                    if(!findCoinLaundry){
                        throw new Error('データの取得に失敗しました')
                    }
                    setCoinLaundry(findCoinLaundry);
                }
                setStatus("succeeded");
            }catch(error){
                console.error('実行が中断されました',error)
                setStatus("failed")
            }
        }
        fetchCoinLaundryStore();
    },[])

     return(
        <>
        {(status === "pending") && <div>読み込み中...</div>}
        {(status === "failed") && <div>読み込み失敗</div>}
        {(status ==="succeeded") && (coinLaundry !==undefined) &&
        <div>
            <h1>せんたくランド{coinLaundry.store}店</h1>
            <p>場所 : {coinLaundry.location}</p>
            <ul>
                {coinLaundry.machines.map(machine => 
                    <li key={machine}>{machine}</li>
                )}
            </ul>
            <p>{coinLaundry.description}</p>
        </div>
        }

        </>
     )
}

export default Mono;