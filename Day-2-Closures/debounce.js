
function debounce(fn, delay){
    let timer

    return function(...arg){
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(arg)
        }, delay)
    }
}

function handleSearch(query) {
    console.log(`Searching for: ${query}`);
}

const deb_fun = debounce(handleSearch, 1000)

deb_fun("J")
deb_fun("Java")
deb_fun("JavaSc")
deb_fun("JavaSCRIP")
deb_fun("Javascript")