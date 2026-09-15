
interface dataSchema {
  name: string,
  email: string,
  age?: number
 
}

export function Card( {data }: {data : dataSchema}){

    return <div className="card">
        <h2>Name is: {data.name}</h2>
        <h4>Email is: {data.email}</h4>
        <h3>Age is: {data.age}</h3>
    </div>
}