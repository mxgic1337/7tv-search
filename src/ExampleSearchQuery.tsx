export const ExampleSearchQuery = ({text, search}:{text: string, search: (query: string)=>void}) => {
    return <div className={'example-query'} onClick={()=>{search(text)}}>
        {text}
    </div>
}