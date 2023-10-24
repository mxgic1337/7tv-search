import {useEffect, useRef, useState} from 'react'
import './App.scss'
import sets from '../sets.json'
import {Emote} from "./Emote.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {faGithub} from "@fortawesome/free-brands-svg-icons";

function App() {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [firstTime, setFirstTime] = useState<boolean>(true)
    const [query, setQuery] = useState<string>("")
    const [searching, setSearching] = useState<number>(-1)
    const [emotes, setEmotes] = useState<any[]>([])
    const [maxEmotes, setMaxEmotes] = useState<number>(50)

    async function searchProfiles() {
        if (searching !== -1) return
        let emoteList: { id: string; name: string, url: string, author: any, unlisted: boolean }[] = []
        let channels = 0
        setSearching(0)
        for (const i in sets) {
            const response = await fetch('https://7tv.io/v3/emote-sets/' + sets[i])
            if (response.ok) {
                const json = await response.json()
                for (const i2 in json.emotes) {
                    const emote = {
                        id: json.emotes[i2].data.id,
                        name: json.emotes[i2].data.name,
                        url: 'https:' + json.emotes[i2].data.host.url + '/4x.webp',
                        author: json.emotes[i2].data.owner,
                        unlisted: !json.emotes[i2].data.state.includes('LISTED'),
                    }
                    if (!emoteList.some(e => e.id === emote.id) && emote.name.toLowerCase().includes(query.toLowerCase())) {
                        emoteList.push(emote)
                    }
                }
                channels++
                setSearching(channels)
            }
            setEmotes(emoteList)
            await new Promise((r)=>{setTimeout(r, 50)})
        }
        setEmotes(emoteList)
        setMaxEmotes(20)
        setSearching(-1)
    }

    function loadMoreEmotes() {
        setMaxEmotes(maxEmotes + 20)
    }

    useEffect(() => {
        searchProfiles()
    }, []);

    return (
        <main>
            <div style={{margin: '30px 0'}}>
                <h1>Wyszukiwarka emotek 7TV</h1>
                <div style={{textAlign: 'center', marginBottom: '10px'}}>
                    <a href={'https://github.com/mxgic1337/7tv-search'}><FontAwesomeIcon icon={faGithub} /> GitHub</a> • <a href={'https://github.com/mxgic1337/7tv-search#readme'}><FontAwesomeIcon icon={faInfoCircle} /> Więcej informacji</a>
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <input placeholder={'Szukaj emotek...'} ref={searchInputRef} onInput={(obj)=>{
                        setQuery(obj.currentTarget.value)
                    }} onKeyDown={(e)=>{
                        if (e.key === 'Enter' && searching === -1) searchProfiles()
                    }}/>
                    <button onClick={searchProfiles} disabled={searching !== -1}>Szukaj</button>
                </div>
            </div>
            {searching !== -1 && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <FontAwesomeIcon icon={faSpinner} className={'loading'} />
                <b><p>Wyszukiwanie...</p></b>
                <p style={{marginBottom: '15px'}}>Emote set {searching} z {sets.length}</p>
            </div>}
            <div className={'emote-list'}>
                {emotes.map((emote, index)=>{
                    if (index > maxEmotes) return;
                    return <Emote key={emote.id} id={emote.id} name={emote.name} author={emote.author} url={emote.url} unlisted={emote.unlisted} />
                })}
                {emotes.length === 0 ? <>
                    <img src={'https://cdn.7tv.app/emote/6287c2ca6d9cd2d1f31b5e7d/4x.webp'} width={'70px'} style={{margin: 'auto auto 10px auto'}} />
                    <p>Nie znaleziono emotek.</p>
                </> : <button onClick={loadMoreEmotes} disabled={maxEmotes >= emotes.length}>Wczytaj więcej emotek</button>}
            </div>
            <footer>
                <a className={'link'} href={'https://github.com/mxgic1337/7tv-search'} target={'_blank'}><FontAwesomeIcon icon={faGithub} /></a>
                <p>7TV Search is <b>not affiliated</b> with <a href={'https://7tv.app'} target={'_blank'} style={{
                    color: '#102236'}}>7TV</a>.</p>
            </footer>
        </main>
    )
}

export default App
