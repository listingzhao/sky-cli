import 'babel-polyfill';
import * as React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

let hello: string = 'Hello WPT'

class App extends React.Component {
    render() {
        return <div>
            <h1>Hello React & Webpack!</h1>
            <ul>
                {
                    ['a', 'b', 'c'].map((name, index) => <li key={index}>{`I'm ${name}!`}</li>)
                }
            </ul>
        </div>
    }
}

// debugger
console.log(hello)
ReactDOM.render(
    <App />,
    document.getElementById('root')
)