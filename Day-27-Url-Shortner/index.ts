
//  save, check, return long url
export class UrlRepository{
    private map : Map<string, string>;

    constructor(){
        this.map = new Map<string, string>()
    }

    public save(shortCode: string, longCode: string){
        if(this.map.has(shortCode)){
            console.log("This url code already Exists...❌")
            return
        }

        this.map.set(shortCode, longCode)
    }

    public check(shortCode: string){
        if(this.map.has(shortCode)){
            console.log("We found your original url in our database...✅✅");
            return true;
        }
        return false;
    }

    public getLongUrl(shortCode: string){
        if(this.map.has(shortCode)){
            
            return this.map.get(shortCode)
        }
        return "Not found"
    }

}

// --------------------------------------

export class CodeGenerator{
    private random = "eqwaHtmTOGlCpW4j3rqU17zSKB8OSvpwfA9mWc8m2NS18PSPPvTFiWhyP0H7lSF9j0gpAFd6DHhlYyhk"

    public generateShortUrl(length: number){
        let result = "";

        for(let i=0; i<length; i++){
            result += this.random.charAt(Math.random() * this.random.length)
        }

        return result;
    }
}

// ----------------------------------------------------------

export class UrlShortenerService{
    private repo : UrlRepository
    private generator: CodeGenerator

    constructor(repo: UrlRepository, generator: CodeGenerator){
        this.repo = repo
        this.generator = generator
    }

    public shortenUrl(longCode: string){
        let random = "0qkbTVIhPOZdnhyRJKBYXqNKxHYe0d0chKiM934U"
        let short = this.generator.generateShortUrl(8)

        while(this.repo.check(short)){
            short += random.charAt(Math.random() * random.length)
        }

        this.repo.save(short, longCode)

        return short
    }

    public getLongUrl(shortCode: string){

        if(this.repo.check(shortCode)){
            let long = this.repo.getLongUrl(shortCode)
            return long
        }
        return "No long url Found"
    }
}

const repo = new UrlRepository();
const generator = new CodeGenerator();
const service = new UrlShortenerService(repo, generator);

const short = service.shortenUrl("https://example.com/some/long/linkgrnjgrgururh");
console.log("Short url is: ", short);
console.log("---------------------------------------------")
const long_Org = service.getLongUrl(short)
console.log("Long Original url is: ", long_Org);