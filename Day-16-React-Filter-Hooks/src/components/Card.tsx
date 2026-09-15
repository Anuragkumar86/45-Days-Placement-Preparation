
interface dataSchema {
  id: number,
  title: string,
  category: string,
  price: number,
  inStock: boolean
}

export function Card( {data }: {data : dataSchema}){

    return <div className="card">
        <h2>{data.title}</h2>
        <h4>{data.category}</h4>
        <h3>{data.price}</h3>
        <p>{data.inStock ? "In-Stock" : "Out-Off-Stock"}</p>
    </div>
}