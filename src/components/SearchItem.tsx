"use client";
import { useState, useEffect, ChangeEvent } from 'react'

const SearchItem = () => {

    const [source, setSource] = useState("")
    const [results, setResults] = useState([])

    const handleSearch = (e:ChangeEvent<HTMLInputElement>) => {

        setSource(e.target.value);

    }

    useEffect(() => {



    }, [source])

    return (

        <li> 
              
        <input type="search" name="searchAll" id="searchAll" onChange={handleSearch}/>
        {/* Dropdown do search (resultados) */}
        <div>

        </div>

        </li>

    )

}

export default SearchItem