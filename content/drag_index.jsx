/*import React from 'react';
import ReactDOM from 'react-dom/client';
*/

const punct='\\['+ '\\!'+ '\\"'+ '\\#'+ '\\$'+   // since javascript does not
          '\\%'+ '\\&'+ '\\\''+ '\\('+ '\\)'+  // support POSIX character
          '\\*'+ '\\+'+ '\\,'+ '\\\\'+ '\\-'+  // classes, we'll need our
          '\\.'+ '\\/'+ '\\:'+ '\\;'+ '\\<'+   // own version of [:punct:]
          '\\='+ '\\>'+ '\\?'+ '\\@'+ '\\['+
          '\\]'+ '\\^'+ '\\_'+ '\\`'+ '\\{'+
          '\\|'+ '\\}'+ '\\~'+ '\\]',

    re=new RegExp(     // tokenizer
       '\\s*'+            // discard possible leading whitespace
       '('+               // start capture group
         '\\.{3}'+            // ellipsis (must appear before punct)
         /*
       '|'+               // alternator
         '\\w+\\-\\w+'+       // hyphenated words (must appear before punct)
       '|'+               // alternator
         '\\w+\'(?:\\w+)?'+   // compound words (must appear before punct)
       '|'+               // alternator
         '\\w+'+              // other words
         */
       '|'+               // alternator
         '['+punct+']'+        // punct
       ')'                // end capture group
     );
     
const tokenize = (str) => {
	let arr = str.split(re);
	let ret = [];
  for(let s of arr){
  	let x = s.split(/\s+/);
    ret = [...ret, ...x];
  }
  return ret.filter(e=>e.length>0).map(e=>e.toLowerCase());
};

//source: https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

function QuestionNumber(props){
  return (
    <div className="questionnumber">
      <span className="actNum">{props.actNum}</span> / <span className="totNum">{props.totNum}</span>
    </div>
  );
}

class CardItem extends React.Component {
	constructor(props){
  	super(props);
    this.state = {
    	dragEnabled: props.dragEnabled
    };
  }
  
	handleDragStart = e => {
    //console.log(`handleDragStart :: ${this.props.listitemkey}`);
    e.dataTransfer.setData("text/plain", this.props.listitemkey.toString());
  }
  
  handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    let from = e.dataTransfer.getData("text/plain");
    let to = e.target.dataset.itemkey;
   	//console.log(`CardItem: drag from ${from} to ${to}`);
    this.props.wordDragged(from, to);
  }
  
  handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  switch = e => {
  	this.setState({dragEnabled: e} /*, () => console.log(`CardItem: e=${e} -> dragEnabled=${this.state.dragEnabled}`)*/
    );
  }
  
	render() {
    //console.log(`CardItem.render() :: ${this.props.word}`);
  	return (
      <div className="word"
          key={this.props.listitemkey}
          data-itemkey={this.props.listitemkey}
          draggable={this.state.dragEnabled ? "true" : "false" }
          onDrop={this.state.dragEnabled ? this.handleDrop : null}
          onDragStart={this.state.dragEnabled ? this.handleDragStart : null}
        onDragOver={this.handleDragOver}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        >
        {this.props.word}
      </div>
      );
  };
}

class CardContainer extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
    	arr: props.arr.map(e=>e),
      dragEnabled: props.dragEnabled,
      visibleEnabled: props.visibleEnabled
    };
    this.dragListeners = props.arr.map(e=>React.createRef());
    //console.log(`CardContainer :: visibleEnabled=${this.state.visibleEnabled}`);
   };
   
   setVisible = (b) => {
   	this.setState({visibleEnabled: b});
   };
   
   switchDrag = () => {
     this.state.dragEnabled = !this.state.dragEnabled;
     //console.log(`CardContainer: ${this.state.dragEnabled}`);
     //notify listeners...
     for(const x of this.dragListeners){
     	 x.current.switch(this.state.dragEnabled);
     }
   }
   
   wordDragged = (from, to) => {
     //reorder array
     if(from != to){
      let newArr = this.state.arr.map(e=>e);
      let fromElement = newArr.splice(from,1)[0];
      let toPos = (from < to ? to-1 : to);
      newArr.splice(toPos,0,fromElement);
      //ask for rendering component
      this.setState({arr: newArr});
      //notify parent of new word order
      this.props.handleWordDrag(this.state.arr);
     }
   };
   
   
   render() {
    if(this.state.visibleEnabled)
    {
      return (
        <div>
          {this.state.arr.map((e,i) => {
            //console.log(`CardContainer.render(): i=${i}`);
            return (
        		<CardItem 
                listitemkey={i} 
                word={e} key={i} 
                wordDragged={this.wordDragged} 
                dragEnabled={this.state.dragEnabled} 
                ref={this.dragListeners[i]} 
             />);}
           )//map
         	}
        </div>
    );
    } else {
    	return null;
    }
   }
 }

class Question extends React.Component{
  constructor(props){
  	super(props);
    this.state = {
      dragEnabled: props.dragEnabled,
      showExpected: false
    };
    this.ansContainer = React.createRef();
    this.expContainer = React.createRef();
  }
  
  setDraggable = (b) => {
    //console.log(`this.childContainer=${this.childContainer.current.switchDrag}`);
  	this.ansContainer.current.switchDrag();
  }
  
  showExpected = (b) => {
    console.log(`Question :: showExpected ${b}`);
  	this.setDraggable(!b);
    this.expContainer.current.setVisible(b);
  }
  
  render() {
  	return (
    <table><tbody><tr>
        <td><span className="lang">{this.props.qLang}</span></td>
        <td><span className="question">{this.props.qSentence}</span></td>
      </tr><tr>
        <td><span className="lang">{this.props.aLang}</span></td>
        <td><CardContainer 
              ref={this.ansContainer}
              arr={this.props.aArr} 
              handleWordDrag={this.props.handleWordDrag} 
              dragEnabled={this.state.dragEnabled} 
              visibleEnabled={true}
              /></td>
      </tr><tr>
        <td />
        <td><CardContainer 
              ref={this.expContainer}
              arr={this.props.eArr} 
              handleWordDrag={null} 
              dragEnabled={false}              
              visibleEnabled={false}
              /></td>
      </tr>
      </tbody></table>
    );
  }
}

class TestButton extends React.Component {
  constructor(props){
  	super(props);
  }
  
  handleClick = (e) => {
    this.props.callBack(e);
  }
  
  render() {
    return (
      <button onClick={this.handleClick}>
        {this.props.caption}
      </button>
    );
  }
}

class Test extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
    	words: props.aArr.map(e=>e),
      answerOpen: true
    };
    this.questionTag = React.createRef();
   }
   
   onWordDragged = (newArr) => {
   	  this.setState({words: newArr.map(e=>e)});
   }
   
   exitTest = (e) => {
   	this.props.exitTest(e);
   }
   
   nextTest = (e) => {
    //show correct answer for 3 seconds
    let p1 = new Promise( (resolve, reject) => {
        setTimeout(() => {
          this.state.answerOpen = false;
          this.questionTag.current.showExpected(true);
          console.log(`Test :: answer shown`);
          resolve(true)
        }, 0);
     });
    //proceed to next (by parent)
   	p1.then(resolve => setTimeout(() => {
    			console.log(`Test :: waited for 3 secs`);
        }, 3000)
       ).then(x => this.props.nextTest(e));
   }
   
	render() {
  	return (<div className="test">
    <QuestionNumber actNum={this.props.actNum} totNum={this.props.totNum} />
    <Question
      ref={this.questionTag}
      qLang={this.props.qLang} 
      qSentence={this.props.qSentence} 
      aLang={this.props.aLang}
      aArr={this.state.words}
      eArr={this.props.expResult}
      dragEnabled={this.state.answerOpen}
      handleWordDrag={this.onWordDragged}
      />
    <table><tbody>
    <tr>
    <td className="exitTest"><TestButton callBack={this.exitTest} caption="Exit" /></td>
    <td className="nextTest"><TestButton callBack={this.nextTest} caption="Next" /></td>
    </tr>
    </tbody></table>
  </div>);
  }
}

class TestContainer extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
      tests: this.extractTests(props.tests),
      totTestNum: props.tests.length,
      qLang: props.qLang,
      aLang: props.aLang,
    	actTestNum: 0,
      tsContainerStart: new Date(),
      aAnswers: [] //Array of {answer: |-sep String, tsSubmit: timestamp}
    };
  } //constructor
  
  extractTests = (testArr) => {
  	//testArr: Array of {qSentence: String, aSentence: String}
    return testArr.map((e,i) => {
      let aSent = tokenize(e.aSentence);
    	let ret = {
      	qSentence: e.qSentence,
        aSentence: shuffleArray( aSent ),
        expResult: aSent.join('|'),
        tsActStart: (nuli==0 ? new Date() : nulll)
      };
      return ret;
    });
  };
  
  nextTest = (e, strAns) => {
  	if(this.state.actTestNum < this.state.totTestNum){
      //save completion time and answer
      let ans = {
      			answer: strAns, 
            secSpent: (new Date() - this.state.tests[this.state.actTestNum].tsActStart)/1000,
            result: strAns == this.state.tests[this.state.actTestNum].expResult
            };
    
 	    //show next test
    	this.setState({
      		actTestNum: this.state.actTestNum+1,
          aAnswers: [...this.state.aAnswers, ans]
      	});
      this.state.tests[this.state.actTestNum].tsActStart = new Date();
    } else {
    	this.exitTest();
    }
  };
  
  exitTest = (e) => {
  	//compile results
    let res = {
    	totTestNum: this.state.totTestNum,
      cntAnswered: this.state.aAnswers.length,
      timeSpent: new Date() - this.state.tsContainerStart,
      cntGoodAns: this.state.aAnswers.reduce(
                     e=>(e.result ? 1 : 0)
      							,0
      						)
    };
  	//exit => navigate to Results
  };
  
  render() {
    console.log(`expResult: ${JSON.stringify(this.state.tests[this.state.actTestNum].expResult)}`);
    
  	return (
    	<Test 
        actNum={this.state.actTestNum+1}
        totNum={this.state.totTestNum}
        qLang={this.state.qLang}
        qSentence={this.state.tests[this.state.actTestNum].qSentence}
        aLang={this.state.aLang}
        aArr = {this.state.tests[this.state.actTestNum].aSentence}
        expResult = {this.state.tests[this.state.actTestNum].expResult}
        exitTest={this.exitTest} 
        nextTest={this.nextTest}
/>);
  }//render
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<Test actNum="3" totNum="8" qLang="EN" qSentence="Now I will tell you the story of the tree." aLang="TR" 
aArr = {shuffleArray(tokenize('Şimdi sizlerle, ağacın hikayesini anlatacağım.'))}
expResult = {tokenize('Şimdi sizlerle, ağacın hikayesini anlatacağım.')}
/>);
