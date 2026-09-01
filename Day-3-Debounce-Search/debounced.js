
function debounce(fn, delay){
    let timerId = null

    return function(...arg){
        if(timerId){

            clearTimeout(timerId)
        }

        timerId = setTimeout(() => {
            fn.apply(this, arg)
        }, delay)
    }
}

function FakeDataSimulation(text){
    console.log(`Currently sending request with the text: ${text}`)
}

const debouncedFn = debounce(FakeDataSimulation, 500)

setTimeout(() => debouncedFn("An"), 100);
setTimeout(() => debouncedFn("Anu"), 200);
setTimeout(() => debouncedFn("Anur"), 300);
setTimeout(() => debouncedFn("Anura"), 400);
setTimeout(() => debouncedFn("Anurag"), 500);
setTimeout(() => debouncedFn("Anurag Ya"), 1100);
setTimeout(() => debouncedFn("Anurag Yadav"), 1200);