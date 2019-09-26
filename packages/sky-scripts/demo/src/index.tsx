import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './index.css'
import './lessA.less'

// css module
const S = require('./style/index.m.css')
const C = require('./style/com.m.css')
const LessB = require('./lessB.m.less')

let hello: string = 'Hello WPT'

// hello = 123

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
