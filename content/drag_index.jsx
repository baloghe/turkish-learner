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

function CardItem({listitemkey, word}){
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
    console.log(`${e.dataTransfer.getData("text/plain")} -> ${e.target.dataset.itemkey}`);
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

function CardContainer({arr=[], handleDragStart, handleDragEnd}){
	return (<div>
  	{arr.map((e,i) => {return <CardItem listitemkey={i} word={e} key={i} />;})}
    </div>
  );
}

function Question(props){
	//console.log(`${props.aArr}`);
  return (
  <table><tbody><tr>
      <td><span className="lang">{props.qLang}</span></td>
      <td><span className="question">{props.qSentence}</span></td>
    </tr><tr>
      <td><span className="lang">{props.aLang}</span></td>
      <td><CardContainer arr={props.aArr}/></td>
    </tr>
    </tbody></table>
  );
}

function Test(props){
 return (
  <div className="test">
    <QuestionNumber actNum={props.actNum} totNum={props.totNum} />
    <Question qLang={props.qLang} qSentence={props.qSentence} 
    aLang={props.aLang} aArr={props.aArr}/>
  </div>
);
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<Test actNum="3" totNum="8" qLang="EN" qSentence="Now I will tell you the story of the tree." aLang="TR" aArr={['sizlerle','hikayesini','şimdi','ağacın','anlatacağım','.',',']} />);
