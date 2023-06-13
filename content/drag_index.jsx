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

/*----------------------------------
	Test Components
----------------------------------*/

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
    	arr: props.arr.map(e=>e)
    };
    //console.log(`CardContainer :: constr arr: ${this.state.arr.length}`);
    
   };//constructor
   
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
      this.props.handleWordDrag(newArr);
     }
   };
   
   render() {
    /*console.log(`CardContainer.render() :: wordClasses=${this.props.wordClasses}, arr.length=${this.state.arr.length}, visibleEnabled=${this.state.visibleEnabled}`);*/
    
      return (
        <div>
          {this.state.arr.map((e,i) => {
            //console.log(`CardContainer.render(): i=${i}`);
            return (
        		<CardItem
                wordClasses={this.props.wordClasses}
                listitemkey={i} 
                word={e} key={'c'+i} 
                wordDragged={this.wordDragged} 
                dragEnabled={this.props.dragEnabled} 
                /*ref={this.state.dragListeners[i]}*/
                actNum={this.props.actNum}
             />);}
           )//map
         	}
        </div>
    );
   }
   
 }
 
 

class Question extends React.Component{
  constructor(props){
  	super(props);
  }
  
  renderUserAnswerContainer = (inModifiable) => {
  	return (
    <tr>
        <td><span className="lang">{this.props.aLang}</span></td>
        <td><CardContainer 
              wordClasses={`word word-answer`}
              arr={this.props.aArr} 
              handleWordDrag={inModifiable ? this.props.handleWordDrag : null} 
              dragEnabled={inModifiable}
              actNum={this.props.actNum}
              />
         </td>
      </tr>
    );
  }
  
  renderExpectedAnswerContainer = () => {
  	return (
    <tr>
        <td></td>
        <td><CardContainer 
              wordClasses={`word word-expected`}
              arr={this.props.eArr} 
              handleWordDrag={null} 
              dragEnabled={false}
              actNum={this.props.actNum}
              />
         </td>
      </tr>
    );
  }
  
  render() {
    //console.log(`Question.render() called, aArr=${this.props.aArr.length}`);
    
  	return (
    <table><tbody><tr>
        <td><span className="lang">{this.props.qLang}</span></td>
        <td><span className="question">{this.props.qSentence}</span></td>
      </tr>
      {this.renderUserAnswerContainer(this.props.dragEnabled)}
      {this.props.dragEnabled ? null : this.renderExpectedAnswerContainer()}
      </tbody></table>
    );
  }
}

class Test extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
    	words: props.aArr.map(e=>e)
    };
    //console.log(`Test.constructor called`);
   }
   
   onWordDragged = (newArr) => {
   		//console.log(`Test.onWordDragged() :: ${newArr.join('|')}`);
      this.props.updateContainer(newArr.map(e=>e));
   	  this.setState({words: newArr.map(e=>e)});
   }
   
   exitTest = (e) => {
   	this.props.exitTest(e);
   }
   
	render() {
  	//console.log(`Test.render() called, actNum=${this.props.actNum}, words: ${this.state.words.length}, drag: ${this.props.dragEnabled}, aArr=${this.props.aArr.join('|')}, words=${this.state.words.join('|')}`);
  	return (<div className="test">
    <QuestionNumber actNum={this.props.actNum} totNum={this.props.totNum} />
    <Question
      actNum={this.props.actNum}
      qLang={this.props.qLang} 
      qSentence={this.props.qSentence} 
      aLang={this.props.aLang}
      aArr={this.state.words}
      eArr={this.props.expResult}
      dragEnabled={this.props.dragEnabled}
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
      dragEnabled: true,
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
      //console.log(`${i}: ${ret.qSentence} = ${ret.aSentence}`);
      return ret;
    });
  };
  
  showExpectedResult = (res) => {
  	this.setState({
      		dragEnabled: false,
          actResult: res
      	});
  }
  
  updateUserAnswer = (ansArr) => {
  	this.state.tests[this.state.actTestNum].aSentence = ansArr;
    //console.log(`updateUserAnswer: ${this.state.tests[this.state.actTestNum].aSentence.join('|')}`);
  }
  
  containerNextTest = (e) => {
  	//console.log(`TestContainer.nextTest entered...`);
    
   let strAns = this.state.tests[this.state.actTestNum].aSentence.join('|');
    let expAns = this.state.tests[this.state.actTestNum].expResult.join('|');
    let tstResult = (strAns.trim() == expAns.trim());
    this.showExpectedResult(tstResult);
    
    const st1 = setTimeout(() => {
      let tstSecSpent = (new Date() - this.state.tests[this.state.actTestNum].tsActStart)/1000;
      
      let ans = {
              secSpent: tstSecSpent,
              result: tstResult
              };
        //show next test
        this.state.tests[this.state.actTestNum].tsActStart = new Date();
        this.state.aAnswers = [...this.state.aAnswers, ans]
        
        //console.log(`containerNextTest :: ans=${JSON.stringify(this.state.aAnswers)}`);
    
      if(this.state.actTestNum < this.state.totTestNum-1){
        //save completion time and answer
        this.setState({
            actTestNum: this.state.actTestNum+1,
            tsActStart: new Date(),
            dragEnabled: true
          });
        //console.log(`TestContainer.nextTest: setState() called`);
        } else {
          //console.log(`nextTest: No more tests => exit`);
          this.exitTest();
        }
        
      clearTimeout(st1);
    }, this.props.wait);
  };
  
  exitTest = (e) => {
  	//compile results
    let res = {
    	totTestNum: this.state.totTestNum,
      cntAnswered: this.state.aAnswers.length,
      timeSpent: (new Date() - this.state.tsContainerStart)/1000,
      cntGoodAns: this.state.aAnswers.reduce(
                     (c,e)=>(c+(e.result ? 1 : 0))
      							,0
      						)
    };
  	//exit => navigate to Results
    //console.log(`Test exited, res: ${JSON.stringify(res)}`);
    this.props.dispatchResults(res);
  };
  
  renderButtons(){
  	return (
    <table><tbody>
      <tr>
      <td className="exitTest"><TestButton callBack={this.exitTest} caption="Exit" /></td>
      <td className="nextTest"><TestButton callBack={this.containerNextTest} caption="Next" /></td>
      </tr>
      </tbody></table>
    );
  }
  
  renderActResults(){
  	let clnm = this.state.actResult ? "actres-ok" : "actres-bad";
  	let cont = this.state.actResult ? '\u2705' : '\u274C';
    console.log(`clnm=${clnm}`);
  	return (
    <div><span className={clnm}> {cont} </span></div>
    );
  }
  
  render() {
    
    let tid = (this.state.dragEnabled ? 't' : 'tr') + this.state.actTestNum;
    //console.log(`TestContainer.render() :: actTestNum: ${this.state.actTestNum}, aArr.length=${this.state.tests[this.state.actTestNum].aSentence.length}, tid=${tid}`);
    
  	return (
    	<div>
    	<Test 
        key={tid}
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
        dragEnabled={this.state.dragEnabled}
        updateContainer={this.updateUserAnswer}
/>
    {this.state.dragEnabled ? this.renderButtons() : null}
    {this.state.dragEnabled ? null : this.renderActResults()}
</div>);
  }//render
}

/*----------------------------
   Settings pane components
----------------------------*/
class TopicPane extends React.Component {
	constructor(props){
  	super(props);
    this.state = {
    	activeTitle: this.props.activeTitle
    };
    //console.log(`${props.topics.map(e=>(e.cnt + ' ' + e.title)).join(', ')}`);
  }
  
  titleChanged = (e) => {
  	this.setState({
    	activeTitle: e.target.value
    });
    this.props.selectedTitleChanged(e.target.value);
  };
  
  render(){
  	return (
    	<div className="radios">
      {this.props.topics.map((e,i)=>(
      	<div key={'d'+i}>
          <input 
            key={'i'+i} 
            type="radio" 
            value={i.toString()} 
            name="titles" 
            id={'tit'+i}
            checked={i==this.state.activeTitle}
            onChange={this.titleChanged}
          />
          <label key={'lab'+i} htmlFor={'tit'+i}>
            <span key={'lab'+i+'-1'} className="topic-title">{e.title}</span> 
            <span key={'lab'+i+'-2'} className="topic-title topic-cnt">({e.cnt})</span>
          </label></div>))}
      </div>
    );
  }
}

class Settings extends React.Component {
	constructor(props){
  	super(props);
    this.state = {
    	titles: this.getTitlesFromProps(),
    	activeTitle:this.props.activeTitle == null ? 0 : this.props.activeTitle,
      isRandOrder: this.props.isRandOrder || false,
      qLang: props.qLang,
      aLang: props.aLang
    };
    }
    
  getTitlesFromProps = () => {
  	return this.props.topics.map(e => 
    					{return {title: e.title, cnt: e.cnt};});
  }
  
  loadFile = (e) => {
  	let selectedFile = e.target.files[0];
    this.state.reader = new FileReader();
    this.state.reader.readAsText(selectedFile);
    this.state.reader.onloadend = this.parseXml;
  }
  
  parseXml = () => {
    const parser = new DOMParser();
    const dbMetadata = parser.parseFromString(this.state.reader.result,"text/xml");
    let root = dbMetadata.children[0];
    
    let ndlang = root.getElementsByTagName("languages")[0];
    let langs=[];
    for(let ch of ndlang.children){
    	langs.push(ch.getAttribute('id'));
    }

    let ndsub = root.getElementsByTagName("subjects")[0];
    
    let ret = {languages: langs, topics: []};
    for(let ch of ndsub.children){
      ret.topics.push({id: ch.getAttribute('id'),
                       title: ch.getAttribute('name')});
    }

    let ndsent = root.getElementsByTagName("sentences")[0];
    let subcnt = [];
    for(let ch of ndsent.children){
      let sents = [];
      for(let chx of ch.children){
      	let s={};
      	for(let chy of chx.children){
        	let lang = chy.getAttribute('lang');
          s[lang] = chy.getAttribute('txt').replace(/\[\//g,'').replace(/\/\]/g,'');
        }//chy
        sents.push(s);
      }
      subcnt.push({id: ch.getAttribute('subjectID'),
                   cnt: ch.children.length,
                   sentences: sents
                   });
    }
    ret.topics.forEach(x => {
      x.cnt = subcnt.filter(y => y.id==x.id)[0].cnt;
      x.sentences = subcnt.filter(y => y.id==x.id)[0].sentences;
    });
    
    //console.log(JSON.stringify(ret));

    this.props.fileLoaded(ret);
  }
   
  selectedTitleChanged = (newIdx) => {
  	//console.log(`newIdx=${newIdx}`);
  	this.setState({
    	activeTitle: newIdx
    });
  }
  
  setRandOrder = () => {
  	this.setState({
    	isRandOrder: !this.state.isRandOrder
    });
  }
  
  changeLang = () => {
  	let [newQLang, newALang] = [this.state.aLang, this.state.qLang];
    this.setState({
    	qLang: newQLang,
      aLang: newALang
    });
    
    this.props.setLang([newQLang, newALang]);
  }
  
  startTest = () => {
    let actTitle = this.state.activeTitle;
    let actRand = this.state.isRandOrder;
  	console.log(`Start test no. ${actTitle}: ${this.props.topics[this.state.activeTitle].title}, random: ${actRand}`);
    this.props.startTest(actTitle, actRand);
  }
    
  render() {
  	return (
    	<div className="settings">
        <h3>Choose a topic!</h3>
        <TopicPane
          topics={this.props.topics}
          activeTitle={this.state.activeTitle}
          selectedTitleChanged={this.selectedTitleChanged}
        />
        <div className="chkbx">  
          <label key="labFromFile" htmlFor="fromFile">
            Load XML: 
          </label>      
          <input 
            key="fromFile"
            type="file"
            id="fromFile"
            name="fromFile"
            onChange={this.loadFile}
          />
        </div>
        <div className="chkbx">
          <input
            key="randOrder"
            type="checkbox" 
            id="randOrder"
            name="randOrder"
            value="randOrder"
            checked={this.state.isRandOrder}
            onChange={this.setRandOrder}
          />
          <label key="labRandOrder" htmlFor="randOrder">
            Random order
          </label>
          <button onClick={this.changeLang}>
          <span>{this.state.qLang} &rarr; {this.state.aLang}</span>
          </button>
        </div>
        <button className="startBtn" onClick={this.startTest}>
        <span>Start</span>
        </button>
      </div>
    );
  }
}

/*-------------------------------
   APP components
-------------------------------*/
class App extends React.Component {
	constructor(props){
  	super(props);
    this.state = {
    	topics: this.getTopics(props.tests),
      tests: props.tests,
      actTopic: 0,
      actRandom: false,
      actPhase: "settings",
      results: [],
      qLang: props.qLang,
      aLang: props.aLang
    };
  }
  
  getTopics = (inp) => {
  	return inp.map(e=>{
    	return {title: e.title, cnt: (e.sentences ? e.sentences.length : 0)};
    })
  }
  
  setLang = ([inQLang, inALang]) => {
  	this.setState({
    	qLang: inQLang,
      aLang: inALang
    });
  }
  
  fileLoaded = (inFileData) => {
  	let loadedTopics = inFileData.topics.map(e => {return {title: e.title, cnt: e.cnt};});
    
    this.state.qLang = inFileData.languages[0];
    this.state.aLang = inFileData.languages[1];
    
    let loadedTests = inFileData.topics.map(e => {
    	let ret = [];
      for(let ch of e.sentences){
      	/*
      	let s = {qSentence: ch[this.state.qLang],
                  aSentence: ch[this.state.aLang]};
        */
        ret.push(ch);
      }
      return {sentences: ret};
    });
    
    this.setState({
    	topics: loadedTopics,
      tests:  loadedTests
    });
  }
  
  showResults = (res) => {
  	//console.log(`App: Test finished: ${JSON.stringify(res)}`);
    this.state.results.unshift(res);
    this.setState({
    	results: this.state.results.filter((e,i)=>i<5),
      actPhase: "results"
    });
    const st1 = setTimeout(() => {
      this.setState({
        actPhase: "settings"
      });
      clearTimeout(st1);
      }
      ,this.props.wait*2
    );
    
  }
  
  getRandomizedSentences = (idx) => {
  	
  	let arr = this.state.tests[idx].sentences.map(
    		/*e=>{return {qSentence: e.qSentence, aSentence: e.aSentence};}*/
        e=>e
    );
    return shuffleArray(arr);
    
    //return this.props.tests[idx].sentences;
  }
  
  startTest = (inTopic, inRandom) => {
  	this.setState({
    	actTopic: inTopic,
      actRandom: inRandom,
      actPhase: "test"
    });
  }
    
  renderSettings = () => {
    return (
      <Settings
        topics={this.state.topics}
        startTest={this.startTest}
        activeTitle={this.state.actTopic}
        isRandOrder={this.state.actRandom}
        fileLoaded={this.fileLoaded}
        qLang={this.state.qLang}
        aLang={this.state.aLang}
        setLang={this.setLang}
        />
    );
  }
    
  renderTestContainer = () => {
    let actSentences =(
      this.state.actRandom
      ? this.getRandomizedSentences(this.state.actTopic)
      : this.state.tests[this.state.actTopic].sentences
    ).map(e => {
    	return {
      	qSentence: e[this.state.qLang],
        aSentence: e[this.state.aLang]
      };
    });
    //console.log(`this.state.tests[this.state.actTopic].sentences: ${JSON.stringify(this.state.tests[this.state.actTopic].sentences)}`);
    //console.log(`actSentences: ${JSON.stringify(actSentences)}`);
    return (
      <TestContainer 
        qLang={this.state.qLang}
        aLang={this.state.aLang}
        tests={actSentences}
        wait={this.props.wait}
        dispatchResults={this.showResults}
        />
    );
  }
  
  renderResults = () => {
    	return (
      <div className="results-overall">
        <div className="results">
          <h3 className="results-head">
            Results
          </h3>
        </div>
        <table className="results">
          <thead>
            <tr>
              <th key="rc1">All</th>
              <th key="rc2">Good</th>
              <th key="rc3">Bad</th>
              <th key="rc4">Time (s)</th>
              <th key="rc5">%</th>
            </tr>
          </thead>
          <tbody>
            {this.state.results.map((e,i)=>{
            	return (
            	<tr key={'rr'+i}>
              <td key={'rr'+i+'-1'}>{e.totTestNum}</td>
              <td key={'rr'+i+'-2'}>{e.cntGoodAns}</td>
              <td key={'rr'+i+'-3'}>{e.cntAnswered - e.cntGoodAns}</td>
              <td key={'rr'+i+'-4'}>{e.timeSpent}</td>
              <td key={'rr'+i+'-5'}>{Math.round(e.cntGoodAns * 100 / e.totTestNum)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      );
  }
  
  render() {
		if(this.state.actPhase == "settings") {
      return this.renderSettings();
    } else if(this.state.actPhase == "test") {
      return this.renderTestContainer();
  	} else if(this.state.actPhase == "results") {
      return this.renderResults();
  	}
	}
}

/*-------------------------------
   Actual inputs and root rendering
-------------------------------*/

const mockTests = [
{title: "Ağaç Nasil Oluşur?",
 sentences: [
{ EN: "Do you recognize me?"
 ,TR: "Beni tanıdınız mı?"
},{ EN: "Yes, I'm a tree."
 ,TR: "Evet, ben bir ağacım."
},{ EN: "Now I will tell you the story of the tree."
 ,TR: "Şimdi sizlerle, ağacın hikayesini anlatacağım."
},{ EN: "First, let me introduce myself to you more closely."
 ,TR: "Önce size kendimi daha yakından tanıtayım."
},{ EN: "These are my leaves!"
 ,TR: "Bunlar yapraklarım!"
},{ EN: "These are my nourishing roots beneath the soil."
 ,TR: "Bunlar, toprağın altındaki besleyici köklerim."
}
]},
{title: "Arılar varsa, yarınlar var",
 sentences: [
 { EN: "Then let's go to the flowers together..."
 ,TR: "O zaman gelin hep birlikte çiçeklere doğru gidelim..."
},{ EN: "Here is a worker bee."
 ,TR: "İşte bir işçi arı."
},{ EN: "How quickly it passed."
 ,TR: "Nasıl da hızla geçip gitti."
},{ EN: "Isn't it hard to believe that it was an egg 21 days ago?"
 ,TR: "Onun 21 gün önce bir yumurta olduğuna inanmak zor değil mi?"
}
 ]}
];

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<App qLang="EN" aLang="TR" tests={mockTests} wait={2000}
/>);
