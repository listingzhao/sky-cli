import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css'
import printMe from './pringt.js'

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

console.log(module.hot)
if (module.hot) {
    module.hot.accept('./pringt.js', function () {
        console.log('Accepting the updated printMe module!');
        printMe()
    })
}

// debugger
console.log(hello)
ReactDOM.render(
    <App />,
    document.getElementById('root')
)