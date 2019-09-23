import * as React from 'react'
import * as ReactDOM from 'react-dom'
import S from './style/index.m.css'
import C from './style/com.m.css'
import LessB from './lessB.m.less'
import './index.css'
import './lessA.less'
import printMe from './pringt.js'

let hello: string = 'Hello WPT'

class App extends React.Component {
    render() {
        return (
            <div className={C.container}>
                <h1 className={S.A}>Hello React & Webpack!</h1>
                <h2 className={C.head}>嗷嗷1</h2>
                <h3 className={LessB.B}>sdfsdfsf</h3>
                <ul>
                    {['a', 'b', 'c'].map((name, index) => (
                        <li key={index}>{`I'm ${name}!`}</li>
                    ))}
                </ul>
            </div>
        )
    }
}

console.log(hello)
ReactDOM.render(<App />, document.getElementById('root'))
