import { useEffect, useMemo, useState } from 'react'

import './App.css'
import jsonData from "./assets/data.json"
import { Card } from './components/Card'

interface dataSchema {
  id: number,
  title: string,
  category: string,
  price: number,
  inStock: boolean
}
const PAGE_SIZE = 4;

const ALL_CATEGORIES = ["All","Electronics", "Furniture", "Home & Kitchen"]
function App() {
  const [text, setText] = useState("")
  const [category, setCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)


  const items = jsonData as dataSchema[]

  const filtered = useMemo(() => {
    return items.filter((item) => (item.category === category || category === "All") && item.title.toLowerCase().includes(text.toLowerCase()))
  }, [text, items, category])

  const TOTAL_PAGE = Math.ceil(filtered.length / PAGE_SIZE)
  const startPage = (currentPage - 1) * PAGE_SIZE;
  const endPage =  startPage + PAGE_SIZE

  const paginated = useMemo(() => {
    return filtered.slice(startPage, endPage)
  }, [startPage, endPage, filtered])

  useEffect(() => {
    setCurrentPage(1);
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => {
      clearTimeout(timer)
      setLoading(false)
    }
  },[category, text])

  if(loading){
    return <h1>Loading...</h1>
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1);
  }

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
  }


  return (
    <>
      <h1>Hello Anurag Yadav</h1>

      <div>
        <input
        value={text}
        onChange={(e) => {
          setText(e.target.value)
        }}></input>
      </div>

      <div>
         <select 
        id="category-select"
        value={category} 
        onChange={(e) => {
          setCategory(e.target.value)
        }}
      >
        {ALL_CATEGORIES.map((cat) => {
          return <option key={cat} value={cat}>{cat}</option>
        })}
      </select>
      </div>

      <div>
        {paginated.map((item) => {
          return <div key={item.id}>
            <Card data={item}></Card>
          </div>
        })}
      </div>

      <div>
        <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        >previous
        </button>

        <button
        onClick={handleNext}
        disabled={currentPage === TOTAL_PAGE}
        >next
        </button>

        <p>Page {currentPage} of {TOTAL_PAGE}</p>
      </div>
    </>
  )
}

export default App
