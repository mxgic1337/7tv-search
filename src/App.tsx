import {useRef, useState} from 'react'
import './App.scss'
import sets from '../sets.json'
import {Emote} from "./Emote.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {faGithub} from "@fortawesome/free-brands-svg-icons";
import packageJSON from '../package.json'
import {ExampleSearchQuery} from "./ExampleSearchQuery.tsx";

function App() {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [firstTime, setFirstTime] = useState<boolean>(true)
    const [query, setQuery] = useState<string>("")
    const [searching, setSearching] = useState<number>(-1)
    const [emotes, setEmotes] = useState<any[]>([])
    const [maxEmotes, setMaxEmotes] = useState<number>(20)

    async function searchProfiles(query: string) {
        if (searching !== -1) return
        console.time("Loading emotes")
        let emoteList: { id: string; name: string, url: string, author: any, unlisted: boolean }[] = []
        let channels = 0
        setSearching(0)
        setFirstTime(false)
        for (const i in sets) {
            const response = await fetch('https://7tv.io/v3/emote-sets/' + sets[i])
            if (response.ok) {
                channels++
                setSearching(channels)
                const json = await response.json()
                let loadedEmotes = 0
                for (const i2 in json.emotes) {
                    const emote = {
                        id: json.emotes[i2].data.id,
                        name: json.emotes[i2].data.name,
                        url: 'https:' + json.emotes[i2].data.host.url + '/4x.webp',
                        author: json.emotes[i2].data.owner,
                        unlisted: !json.emotes[i2].data.state.includes('LISTED'),
                    }
                    if (!emoteList.some(e => e.id === emote.id) && (matchesFilter(emote.name, query) || matchesFilter(emote.author.display_name, query))) {
                        emoteList.push(emote)
                    }
                    loadedEmotes++;
                    console.log(`Loaded emote ${emote.name} from "${json.name}" set. (${loadedEmotes}/${json.emotes.length})`)
                }
            }
            setEmotes(emoteList)
        }
        setEmotes(emoteList)
        setMaxEmotes(20)
        setSearching(-1)
        console.log("Loading emotes finished.")
        console.timeEnd("Loading emotes")
    }

    function loadMoreEmotes() {
        setMaxEmotes(maxEmotes + 20)
    }

    function search(query: string) {
        if (searchInputRef.current === null) return
        searchInputRef.current.value = query
        setQuery(query)
        searchProfiles(query).then()
    }

    function matchesFilter(text: string, filter: string) {
        const filters = filter.split(' ')
        for (const i in filters) {
            if (text.toLowerCase().includes(filters[i].toLowerCase())) return true
        }
        return false
    }

    return (
        <main>
            <div style={{margin: '30px 0'}}>
                <h1>Wyszukiwarka emotek 7TV</h1>
                <div style={{textAlign: 'center', marginBottom: '10px'}}>
                    Wyszukaj popularne oraz ukryte emotki!<br />
                    <a href={'https://github.com/mxgic1337/7tv-search'}><FontAwesomeIcon icon={faGithub} /> GitHub</a> • <a href={'https://github.com/mxgic1337/7tv-search#readme'}><FontAwesomeIcon icon={faInfoCircle} /> Więcej informacji</a>
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <input placeholder={'Szukaj emotek...'} ref={searchInputRef} onInput={(obj)=>{
                        setQuery(obj.currentTarget.value)
                    }} onKeyDown={(e)=>{
                        if (e.key === 'Enter' && searching === -1) searchProfiles(query)
                    }}/>
                    <button onClick={()=>{searchProfiles(query)}} disabled={searching !== -1}>Szukaj</button>
                    <div style={{padding: '5px 0', fontSize: '.8rem', color: '#aaa'}}>
                        <p>Czegoś brakuje?</p>
                        <a href={'https://7tv.app/emotes?page=1'}>Skorzystaj z oficjalnej wyszukiwarki</a>
                    </div>
                </div>
            </div>
            {searching !== -1 && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <FontAwesomeIcon icon={faSpinner} className={'loading'} />
                <b><p>Wyszukiwanie...</p></b>
                <p>Przetworzono <b>{searching}</b> z <b>{sets.length}</b> zbiorów</p>
                <div className={'progress-bar'}>
                    <div className={'fill'} style={{width: Math.round((100 * searching)/sets.length) + '%'}}></div>
                </div>
            </div>}
            <div className={'emote-list'}>
                {emotes.map((emote, index)=>{
                    if (index > maxEmotes) return;
                    return <Emote key={emote.id} id={emote.id} name={emote.name} author={emote.author} url={emote.url} unlisted={emote.unlisted} />
                })}
                {emotes.length === 0 ? <>
                {firstTime ? <>
                    <img alt={'Emotka aha15'} src={'https://cdn.7tv.app/emote/641f661b2632d8d9a76eb3ad/4x.webp'} width={'70px'} style={{margin: 'auto auto 10px auto'}} />
                    <p>Wyszukaj emotkę wpisując jej nazwę lub autora w polu powyżej</p>
                    <div style={{textAlign: 'center', margin: '10px 0'}}>
                        <p>Zacznij od:</p>
                        <ExampleSearchQuery text={'aha'} search={search} />
                        <ExampleSearchQuery text={'jasper'} search={search} />
                        <ExampleSearchQuery text={'peepo'} search={search} />
                    </div>

                </> : <>
                    <img alt={'Emotka aha'} src={'https://cdn.7tv.app/emote/6287c2ca6d9cd2d1f31b5e7d/4x.webp'} width={'70px'} style={{margin: 'auto auto 10px auto'}} />
                    <p>Nie znaleziono emotek.</p>
                </>}</> : <button onClick={loadMoreEmotes} disabled={maxEmotes >= emotes.length}>Wczytaj więcej emotek</button>}
            </div>
            <footer>
                <a className={'link'} href={'https://github.com/mxgic1337/7tv-search'} target={'_blank'}><FontAwesomeIcon icon={faGithub} /></a>
                <p>Version <b>{packageJSON.version}</b></p>
                <p>7TV Search is <b>not affiliated</b> with <a href={'https://7tv.app'} target={'_blank'} style={{
                    color: '#102236'}}>7TV</a>.</p>
            </footer>
        </main>
    )
}

export default App
