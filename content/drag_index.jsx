/*import React from 'react';
import ReactDOM from 'react-dom/client';
*/
function QuestionNumber(props){
  return (
    <div className="questionnumber">
      <span className="actNum">{props.actNum}</span> / <span className="totNum">{props.totNum}</span>
    </div>
  );
}

function CardItem({listitemkey, word, wordDragged}){
	const handleDragStart = e => {
    e.dataTransfer.setData("text/plain", listitemkey.toString());
  };
	const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    let from = e.dataTransfer.getData("text/plain");
    let to = e.target.dataset.itemkey;
   	console.log(`CardItem: drag from ${from} to ${to}`);
    wordDragged(from, to);
  };
	return (
  	<div className="word"
    		key={listitemkey}
        data-itemkey={listitemkey}
        draggable
        onDrop={e => handleDrop(e)}
        onDragStart={e => handleDragStart(e)}
        onDragOver={e => handleDragOver(e)}
        onDragEnter={e => handleDragEnter(e)}
        onDragLeave={e => handleDragLeave(e)}
      >
      {word}
    </div>
  );
}

class CardContainer extends React.Component {
	constructor(props) {
    super(props);
    //console.log(`${this.props.handleWordDrag}`);
   };
   
   wordDragged = (from, to) => {
   	 console.log(`CardContainer: drag from ${from} to ${to}`);
     //console.log(`${this.props.handleWordDrag}`);
     this.props.handleWordDrag(from, to);
   };
   
   
   render() {
     return (<div>
      {this.props.arr.map((e,i) => {return <CardItem listitemkey={i} word={e} key={i} wordDragged={this.wordDragged} />;})}
      </div>
    );
   }
 }

function Question(props){
	//console.log(`${props.handleWordDrag}`);
  return (
  <table><tbody><tr>
      <td><span className="lang">{props.qLang}</span></td>
      <td><span className="question">{props.qSentence}</span></td>
    </tr><tr>
      <td><span className="lang">{props.aLang}</span></td>
      <td><CardContainer arr={props.aArr} handleWordDrag={props.handleWordDrag}/></td>
    </tr>
    </tbody></table>
  );
}


class Test extends React.Component {
	constructor(props) {
    super(props);
   }
   
   onWordDragged(from,to) {
   	  console.log(`Test: drag from ${from} to ${to}`);
   };
   
   
	render() {
  	return (<div className="test">
    <QuestionNumber actNum={this.props.actNum} totNum={this.props.totNum} />
    <Question qLang={this.props.qLang} qSentence={this.props.qSentence} 
    aLang={this.props.aLang} aArr={this.props.aArr}
    handleWordDrag={this.onWordDragged}/>
  </div>);
  }
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<Test actNum="3" totNum="8" qLang="EN" qSentence="Now I will tell you the story of the tree." aLang="TR" aArr={['sizlerle','hikayesini','şimdi','ağacın','anlatacağım','.',',']}  />);
