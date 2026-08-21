
function outer(calculate){
    let cache = {}

    return function (val){
        if (cache[val]){
            
            console.log(`Value already cached: ${cache[val]}`)
        }
        else{
            let result = calculate(val)
            cache[val] = result
            console.log(`Value added to cache and printed: ${cache[val]}`)
        }
    }
}

function calculate(n){
    let sum = 0
    for(let i=0; i<=n; i++){
        sum += i
    }

    return sum
}

const memoized = outer(calculate)
memoized(100)
memoized(200)
memoized(100)
memoized(200)

