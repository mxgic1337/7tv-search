import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEyeSlash} from "@fortawesome/free-solid-svg-icons";

export const Emote = ({id, name, author, url, unlisted}:{id: string, name: string, author: any, url: string, unlisted: boolean}) => {
    return <div className={'emote'} onClick={()=>{
        window.open('https://7tv.app/emotes/' + id, '_blank')
    }}>
        <div className={'img'}>
            <img src={url} alt={name} />
        </div>
        <div>
            <p style={{fontWeight: 'bold'}}>{name}{unlisted && <FontAwesomeIcon title={'Ukryta emotka (Unlisted)'} icon={faEyeSlash} className={'unlisted'} />}</p>
            <p>{author.display_name}</p>
        </div>
    </div>
}