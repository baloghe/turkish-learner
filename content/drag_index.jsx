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
  
  enableDrag = e => {
  	this.setState({
    	dragEnabled: e
    });
  }
  
	render() {
  	return (
      <div className={this.props.wordClasses}
          key={this.props.listitemkey}
          data-itemkey={this.props.listitemkey}
          draggable={this.props.dragEnabled ? "true" : "false" }
          onDrop={this.props.dragEnabled ? this.handleDrop : null}
          onDragStart={this.props.dragEnabled ? this.handleDragStart : null}
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
      dragListeners: props.arr.map(e=>React.createRef()),
      dragEnabled: props.dragEnabled,
      visibleEnabled: props.visibleEnabled
    };
    console.log(`CardContainer :: constr arr: ${this.state.arr.length}`);
    
   };//constructor
   
   setVisible = (b) => {
   	this.setState({visibleEnabled: b});
   };
   
   setDraggable = (b) => {
   	 /*
     this.state.dragEnabled = !this.state.dragEnabled;
     //console.log(`CardContainer: ${this.state.dragEnabled}`);
     //notify listeners...
     for(const x of this.dragListeners){
     	 x.current.switch(this.state.dragEnabled);
     }
     */
     this.setState({dragEnabled: b});
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
   
   componentDidUpdate(prevProps, prevState, snapshot){
     //console.log(`CardContainer :: componentDidUpdate called, ${this.props.actNum}`);
     if(this.props.actNum != prevProps.actNum){
       this.setState ({
          arr: this.props.arr.map(e=>e),
          dragListeners: this.props.arr.map(e=>React.createRef()),
          dragEnabled: this.props.dragEnabled,
          visibleEnabled: this.props.visibleEnabled
        });
     }
   }
   
   render() {
    /*console.log(`CardContainer.render() :: wordClasses=${this.props.wordClasses}, arr.length=${this.state.arr.length}, visibleEnabled=${this.state.visibleEnabled}`);*/
    if(this.state.visibleEnabled)
    {
      return (
        <div>
          {this.state.arr.map((e,i) => {
            //console.log(`CardContainer.render(): i=${i}`);
            return (
        		<CardItem
                wordClasses={this.props.wordClasses}
                listitemkey={i} 
                word={e} key={i} 
                wordDragged={this.wordDragged} 
                dragEnabled={this.state.dragEnabled} 
                ref={this.state.dragListeners[i]}
                actNum={this.props.actNum}
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
  	this.ansContainer.current.setDraggable(b);
  }
  
  showExpected = (b) => {
    //console.log(`Question :: showExpected ${b}`);
  	this.setDraggable(!b);
    this.expContainer.current.setVisible(b);
  }
  
  componentDidUpdate(prevProps, prevState, snapshot){
     /*console.log(`Question :: componentDidUpdate called, ${this.props.actNum}`);*/
     if(this.props.actNum != prevProps.actNum){
       this.setState ({
        dragEnabled: this.props.dragEnabled,
      	showExpected: false
      });
     }
    //this.questionTag = React.createRef();
   }
  
  render() {
    console.log(`Question.render() called, aArr=${this.props.aArr.length}`);
    
  	return (
    <table><tbody><tr>
        <td><span className="lang">{this.props.qLang}</span></td>
        <td><span className="question">{this.props.qSentence}</span></td>
      </tr><tr>
        <td><span className="lang">{this.props.aLang}</span></td>
        <td><CardContainer 
              wordClasses={`word word-answer`}
              ref={this.ansContainer}
              arr={this.props.aArr} 
              handleWordDrag={this.props.handleWordDrag} 
              dragEnabled={this.state.dragEnabled} 
              visibleEnabled={true}
              actNum={this.props.actNum}
              /></td>
      </tr><tr>
        <td />
        <td><CardContainer 
              wordClasses={`word word-expected`}
              ref={this.expContainer}
              arr={this.props.eArr} 
              handleWordDrag={null} 
              dragEnabled={false}              
              visibleEnabled={false}
              actNum={this.props.actNum}
              /></td>
      </tr>
      </tbody></table>
    );
  }
}

class Test extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
    	words: props.aArr.map(e=>e),
      dragEnabled: true
    };
    this.questionTag = React.createRef();
   }
   
   onWordDragged = (newArr) => {
   	  this.setState({words: newArr.map(e=>e)});
   }
   
   exitTest = (e) => {
   	this.props.exitTest(e);
   }
   /*
   nextTest = (e) => {
    console.log(`Test.nextTest() called`);
    const st1 = setTimeout(() => {
    			this.state.dragEnabled = false;
          this.questionTag.current.showExpected(true);
          console.log(`Test :: answer shown`);
          clearTimeout(st1);
    		}, 0);
    const st2 = setTimeout(() => {
    			console.log(`Test :: waited for 3 secs`);
          this.props.containerNextTest(e, this.state.words.join('|'))
          clearTimeout(st2);
    		}, this.props.wait);
   }
   */
   componentDidUpdate(prevProps, prevState, snapshot){
     /*console.log(`Test :: componentDidUpdate called, ${this.state.words.join('|')} vs ${this.props.aArr.join('|')}`);*/
     if(this.props.actNum != prevProps.actNum){
       this.setState ({
        words: this.props.aArr.map(e=>e),
        dragEnabled: true
      });
     }
    //this.questionTag = React.createRef();
   }
   
	render() {
  	console.log(`Test.render() called, actNum=${this.props.actNum}, words: ${this.state.words.length}, drag: ${this.state.dragEnabled}`);
  	return (<div className="test">
    <QuestionNumber actNum={this.props.actNum} totNum={this.props.totNum} />
    <Question
      ref={this.questionTag}
      actNum={this.props.actNum}
      qLang={this.props.qLang} 
      qSentence={this.props.qSentence} 
      aLang={this.props.aLang}
      aArr={this.state.words}
      eArr={this.props.expResult}
      dragEnabled={this.state.dragEnabled}
      handleWordDrag={this.onWordDragged}
      />
  </div>);
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
        aSentence: shuffleArray( aSent.map(x=>x) ),
        expResult: aSent,
        tsActStart: (i==0 ? new Date() : null)
      };
      console.log(`${i}: ${ret.qSentence} = ${ret.aSentence}`);
      return ret;
    });
  };
  
  containerNextTest = (e, strAns) => {
  	console.log(`TestContainer.nextTest entered...`);
  	if(this.state.actTestNum < this.state.totTestNum){
      //save completion time and answer
      let ans = {
      			answer: strAns, 
            secSpent: (new Date() - this.state.tests[this.state.actTestNum].tsActStart)/1000,
            result: strAns == this.state.tests[this.state.actTestNum].expResult.join('|')
            };
    	//show next test
      this.state.tests[this.state.actTestNum].tsActStart = new Date();
    	this.setState({
      		actTestNum: this.state.actTestNum+1,
          aAnswers: [...this.state.aAnswers, ans]
      	});
      console.log(`TestContainer.nextTest: setState() called`);
    } else {
      console.log(`nextTest: No more tests => exit`);
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
    console.log(`Test exited`);
  };
  
  render() {
    /*console.log(`TestContainer.render() :: expResult: ${JSON.stringify(this.state.tests[this.state.actTestNum].expResult)}`);*/
    
  	return (
    	<div>
    	<Test 
        actNum={this.state.actTestNum+1}
        totNum={this.state.totTestNum}
        qLang={this.state.qLang}
        qSentence={this.state.tests[this.state.actTestNum].qSentence}
        aLang={this.state.aLang}
        aArr = {this.state.tests[this.state.actTestNum].aSentence}
        expResult = {this.state.tests[this.state.actTestNum].expResult}
        exitTest={this.exitTest} 
        containerNextTest={this.containerNextTest}
        wait={this.props.wait}
/>
    <table><tbody>
    <tr>
    <td className="exitTest"><TestButton callBack={this.exitTest} caption="Exit" /></td>
    <td className="nextTest"><TestButton callBack={this.containerNextTest} caption="Next" /></td>
    </tr>
    </tbody></table>
</div>);
  }//render
}
//Array of {qSentence: String, aSentence: String}
const mockTests = [
{ qSentence: "Do you recognize me?"
 ,aSentence: "Beni tanıdınız mı?"
},{ qSentence: "Yes, I'm a tree."
 ,aSentence: "Evet, ben bir ağacım."
},{ qSentence: "Now I will tell you the story of the tree."
 ,aSentence: "Şimdi sizlerle, ağacın hikayesini anlatacağım."
},{ qSentence: "First, let me introduce myself to you more closely."
 ,aSentence: "Önce size kendimi daha yakından tanıtayım."
},{ qSentence: "These are my leaves!"
 ,aSentence: "Bunlar yapraklarım!"
},{ qSentence: "These are my nourishing roots beneath the soil."
 ,aSentence: "Bunlar, toprağın altındaki besleyici köklerim."
}
];

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<TestContainer qLang="EN" aLang="TR" tests={mockTests} wait={3000}
/>);
