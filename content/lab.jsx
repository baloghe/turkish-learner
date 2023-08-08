const useState = React.useState;

const cards = [
{caption: '\u2550', up: false, down: false, left: true, right: true, turnCW: '\u2551', turnCCW: '\u2551'}
,{caption: '\u2551', up: true, down: true, left: false, right: false, turnCW: '\u2550', turnCCW: '\u2550'}
,{caption: '\u2554', up: false, down: true, left: false, right: true, turnCW: '\u2557', turnCCW: '\u255A'}
,{caption: '\u2557', up: false, down: true, left: true, right: false, turnCW: '\u255D', turnCCW: '\u2554'}
,{caption: '\u255A', up: true, down: false, left: false, right: true, turnCW: '\u2554', turnCCW: '\u255D'}
,{caption: '\u255D', up: true, down: false, left: true, right: false, turnCW: '\u255A', turnCCW: '\u2557'}
,{caption: '\u2560', up: true, down: true, left: false, right: true, turnCW: '\u2566', turnCCW: '\u2569'}
,{caption: '\u2563', up: true, down: true, left: true, right: false, turnCW: '\u2569', turnCCW: '\u2566'}
,{caption: '\u2566', up: false, down: true, left: true, right: true, turnCW: '\u2563', turnCCW: '\u2560'}
,{caption: '\u2569', up: true, down: false, left: true, right: true, turnCW: '\u2560', turnCCW: '\u2563'}
,{caption: '\u256C', up: true, down: true, left: true, right: true, turnCW: '\u256C', turnCCW: '\u256C'}
];

const cardMap = new Map();
cards.forEach(e=>cardMap.set(e.caption, {up: e.up, down: e.down, left: e.left, right: e.right, turnCW: e.turnCW, turnCCW: e.turnCCW}));

const gridShiftRow = (origArr, rows, cols, r, d, excrd) => {
    let si = r*cols;
    let ei = si+cols-1;
    let newGrid = origArr.map(e=>e);
    let newExCrd;
  	//d>0 => shift to the right
    if(d>0){
      let rm = newGrid.splice(ei,1);
      //newGrid.splice(si,0,rm[0]);
      newGrid.splice(si,0,excrd);
      newExCrd = rm[0];
    //otherwise: shift to the left
    } else {
    	let rm = newGrid.splice(si,1);
      //newGrid.splice(ei,0,rm[0]);
      newGrid.splice(ei,0,excrd);
      newExCrd = rm[0];
    }
    return [newGrid, newExCrd];
};


  
const gridShiftCol = (origArr, rows, cols, c, d, excrd) => {
  	let si = c;
    let ei = si+(rows-1)*cols;
    //d>0 => shift down
    let idxs;
    if(d>0){
    	idxs = Array.from({length: rows}, (v, i) => ei-i*cols);
    //else shift up
    } else {
    	idxs = Array.from({length: rows}, (v, i) => si+i*cols);
    }
    //console.log(`shiftCol :: si=${si}, ei=${ei}, idxs=${JSON.stringify(idxs)}`);
    //change array elements one by one
    let newGrid = origArr.map(e=>e);
    for(let i=0; i<idxs.length-1; i++){
    	[ newGrid[idxs[i]] , newGrid[idxs[i+1]] ] = [ newGrid[idxs[i+1]] , newGrid[idxs[i]] ];
      //console.log(`shiftCol :: i=${i}, swap ${idxs[i]} and ${idxs[i+1]}`);
    }
    
    //handle extra card: extra card changes place with last index
    let newExCrd;
    [newGrid[idxs[idxs.length-1]] , newExCrd] = [excrd , newGrid[idxs[idxs.length-1]]];
    
    return [newGrid, newExCrd];
  };
  
const idx2coord = (idx, rowNum, colNum) => {
	const c = idx % parseInt(colNum);
  const r = (idx - c) / parseInt(colNum);
  return {row: r, col: c};
};

const coord2idx = (r, c, colNum) => {
	return r * colNum + c;
};
  
const checkPath = (inGrid, rowNum, colNum, inStartIdx, inEndIdx) => {
	const stack = [{idx: inStartIdx, pth:[]}]; //entries: {idx: num, pth:[...num]}
  while(stack.length > 0 && stack[0].idx != inEndIdx){
  	let actElem = stack.splice(0,1)[0];
    let actPos = idx2coord(actElem.idx, rowNum, colNum);
    let actCard = cardMap.get(inGrid[actElem.idx]);
    
    //check if we can leave actElem upwards
    if(actCard.up && actPos.row > 0){
    	let neighborIdx = coord2idx(actPos.row-1, actPos.col, colNum);
      let neighbor = cardMap.get(inGrid[neighborIdx]);
      //check if neighbor is not already on the actual path
      if(neighbor.down && (!actElem.pth.includes(neighborIdx))){
      	let newElem = {idx: neighborIdx, pth: [...actElem.pth, actElem.idx]};
        stack.unshift(newElem);
      }
    }//up
    //check if we can leave actElem downwards
    if(actCard.down && actPos.row <rowNum-1){
    	let neighborIdx = coord2idx(actPos.row+1, actPos.col, colNum);
    	let neighbor = cardMap.get(inGrid[neighborIdx]);
      //check if neighbor is not already on the actual path
      if(neighbor.up && (!actElem.pth.includes(neighborIdx))){
      	let newElem = {idx: neighborIdx, pth: [...actElem.pth, actElem.idx]};
        stack.unshift(newElem);
      }
    }//down
    
    //check if we can leave actElem leftwards
    if(actCard.left && actPos.col>0){
    	let neighborIdx = coord2idx(actPos.row, actPos.col-1, colNum);
    	let neighbor = cardMap.get(inGrid[neighborIdx]);
      //check if neighbor is not already on the actual path
      if(neighbor.right && (!actElem.pth.includes(neighborIdx))){
      	let newElem = {idx: neighborIdx, pth: [...actElem.pth, actElem.idx]};
        stack.unshift(newElem);
      }
    }//left
    
    //check if we can leave actElem rightwards
    if(actCard.right && actPos.col<colNum-1){
    	let neighborIdx = coord2idx(actPos.row, actPos.col+1, colNum);
    	let neighbor = cardMap.get(inGrid[neighborIdx]);
      //check if neighbor is not already on the actual path
      if(neighbor.left && (!actElem.pth.includes(neighborIdx))){
      	let newElem = {idx: neighborIdx, pth: [...actElem.pth, actElem.idx]};
        stack.unshift(newElem);
      }
    }//right
  }//wend
  //check if a path has been found
  if(stack.length > 0 && stack[0].idx == inEndIdx){
  	return stack[0].pth.filter((e,i)=>(i>0));
  } else {
  	return [];
  }
};
  
function Tile({caption, isMovable, special}){
  
  const specClass = {
  	 'S' : "tile-start"
    ,'F' : "tile-finish"
    ,'P' : "tile-path"
  };
  
  const actClassNames = () => "tile" + " " 
  		+ (isMovable ? "tile-movable" : "tile-frozen")
  		+ (special!=null ? " " + specClass[special] : "")
  		;
  
	return (
  <div className={actClassNames()}>
    {caption}
  </div>
  );
}

function Arrow({caption, isPushable, arrowClicked, idx, direction}){
	
  const [pushable, setPushable] = useState(isPushable);
  
  const handleClick = () => {
  	arrowClicked(idx, direction);
  }
  
  const actClassNames = x => "arrow" + " " + (x ? "arrow-pushable" : "arrow-frozen");
  
  //console.log(`movable=${movable}, actClassNames=${actClassNames(movable)}`);

	return (
  <div className={actClassNames(pushable)} onClick={handleClick}>
    {caption}
  </div>
  );
}

function Rotator({caption, rotatorClicked}){
	
  const handleClick = () => {
  	rotatorClicked();
  }

	return (
  <div className="arrow arrow-pushable" onClick={handleClick}>
    {caption}
  </div>
  );  
}

function ExtraCardManager({excrdCaption, rotateCW, rotateCCW}){

	return (
  <div>
    <p>Extra card:</p>
    <table className="padded"><tbody>
    <tr key="tile"><td className="spanned" colSpan={2}>
      <Tile caption={excrdCaption} isMovable={true} />
      </td>
    </tr>
      <tr key="control">
        <td key="CW" className="padded">
          <Rotator caption={'\u21BB'} rotatorClicked={rotateCW} />
        </td>
        <td key="CCW" className="padded">
          <Rotator caption={'\u21BA'} rotatorClicked={rotateCCW} />
        </td>
      </tr>
    </tbody></table>
  </div>
  );
}

function Board({rows, cols, origMap, exCrd}){

	const [extraCard, setExtraCard] = useState(exCrd);
  const [actMap, setActMap] = useState(origMap);
  const [solPath, setSolPath] = useState([]);
  
  const turnCW = () => {
  	let newCap = cardMap.get(extraCard).turnCW;
    //console.log(`turnCW : ${extraCard} -> ${newCap}`);
  	setExtraCard(newCap);
  };
  const turnCCW = () => {
  	let newCap = cardMap.get(extraCard).turnCCW;
    //console.log(`turnCCW : ${extraCard} -> ${newCap}`);
  	setExtraCard(newCap);
  };
  
  const shiftRow = (r, d) => {
  	const [newGrid, newExCrd] = gridShiftRow(actMap, parseInt(rows), parseInt(cols), r, d, extraCard);
    setActMap( newGrid );
    setExtraCard( newExCrd );
    let pt = checkPath(newGrid, rows, cols, (parseInt(rows)-1)*parseInt(cols), parseInt(cols)-1);
    setSolPath(pt);/*
    console.log(`path: ${checkPath(newGrid, rows, cols, (parseInt(rows)-1)*parseInt(cols), parseInt(cols)-1)}`);*/
  };
  
  const shiftCol = (c, d) => {
  	const [newGrid, newExCrd] = gridShiftCol(actMap, parseInt(rows), parseInt(cols), c, d, extraCard);
    setActMap( newGrid );
    setExtraCard( newExCrd );
    let pt = checkPath(newGrid, rows, cols, (parseInt(rows)-1)*parseInt(cols), parseInt(cols)-1);
    setSolPath(pt);/*
    console.log(`path: ${checkPath(newGrid, rows, cols, (parseInt(rows)-1)*parseInt(cols), parseInt(cols)-1)}`);*/
  };

	const pushable = new Map();
  for(let r = 0; r<parseInt(rows)+2; r++){
  	for(let c = 0; c<parseInt(cols)+2; c++){
    	if(  ((r==0 || r==parseInt(rows)+1) && c>0 && c<parseInt(cols)+1)
         ||((c==0 || c==parseInt(cols)+1) && r>0 && r<parseInt(rows)+1))
      {
      	//console.log(`add ${r+'|'+c}`);
      	pushable.set(r+'|'+c,true);
      }
    }//next c
  }//next r

	const getEmptyCell = (r,c) => {
  	return (
        <td key={'e'+r+'-'+c} />
        );
  }
  
  const getControl = (r,c,m) => {
  	let caption, dir, cbk, idx;
    if(c==(parseInt(cols)+1)){
    	//shift left
      caption = '\u21d0';
      dir = -1;
      cbk = shiftRow;
      idx = r-1;
    } else if(c==0) {
    	//shift right
      caption = '\u21d2';
      dir = 1;
      cbk = shiftRow;
      idx = r-1;
    } else if(r==0) {
    	//shift down
      caption = '\u21d3';
      dir = 1;
      cbk = shiftCol;
      idx = c-1;
    } else {
    	//shift up
      caption = '\u21d1';
      dir = -1;
      cbk = shiftCol;
      idx = c-1;
    }
    return (
        <td key={'c'+r+'|'+c}>
          <Arrow
            caption={caption}
            isPushable={m}
            arrowClicked={cbk}
            idx={idx}
            direction={dir}
          />
        </td>
    );
  }

  const getTile = (c,m,i,spec) => {
  	return (
        <td key={'c'+i}>
          <Tile caption={c} isMovable={m} special={spec}/>
        </td>
        );
  }

  const getRow = (r) => {
    //console.log(`  getRow :: s=${s}, c=${c}`);
    let ret = [];
    if( r==0 || r==parseInt(rows)+1 ){
    	//pure control row
      for(let y=0; y<parseInt(cols)+2; y++){
      	if(y==0 || y==(parseInt(cols)+1)){
        	//empty cell
          ret.push(getEmptyCell(r,y));
        } else {
        	//control button
          ret.push(getControl(r,y,pushable.get(r+'|'+y)));
        }
      }
    } else {
    	//mixed row
      //left arrow
      ret.push( getControl(r,0,pushable.get(r+'|0')) );
      //tiles
      const s=(r-1)*parseInt(cols);
      for(let i=s; i<s+parseInt(cols); i++){
        //console.log(`  getRow :: i=${i}, upper=${upper}`);
        let spec=null;
        if(i==(parseInt(rows)-1)*parseInt(cols)){
        	spec='S';
        } else if(i==(parseInt(cols)-1)) {
        	spec='F';
        } else if(solPath.includes(i)){
        	spec='P';
        }
        ret.push( getTile(actMap[i], true, i, spec) );
      }
      //right arrow
      ret.push( getControl(r,parseInt(cols)+1,pushable.get(r+'|'+(parseInt(cols)+1))) );
    }
    return ret;
  }

  const genRows = () => {
    let i=0;
    const ret = [];
    for(r=0; r<parseInt(rows)+2; r++){
      //console.log(`genRows :: r=${r}`);
      ret.push(<tr key={'r'+r}>
                {getRow(r)}
              </tr>
              );
    }
    return ret;
  }
  
  return (
  	<table className="padded"><tbody>
    <tr><td className="padded">
      <table><tbody>
      {genRows()}
      </tbody></table>
    </td><td className="padded">
      <ExtraCardManager excrdCaption={extraCard} rotateCW={turnCW} rotateCCW={turnCCW} />
      </td></tr>
    </tbody></table>
  );
}

function TestApp1({rows, cols}){
  	
  let brd=[];
  for(let r=0; r<parseInt(rows); r++){
  	for(let c=0; c<parseInt(cols); c++){
    	let idx = Math.floor(Math.random() * parseInt(cards.length));
      brd.push(cards[idx].caption);
    }
  }
  let excrd = cards[Math.floor(Math.random() * parseInt(cards.length))].caption;
  
 return (
  <Board 
rows={rows}
cols={cols}
origMap={brd}
exCrd={excrd}
/>
  );
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<TestApp1 
rows="3"
cols="4"
/>);
