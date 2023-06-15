const useState = React.useState;

const gridShiftRow = (origArr, rows, cols, r, d) => {
    let si = r*cols;
    let ei = si+cols-1;
    let newGrid = origArr.map(e=>e);
  	//d>0 => shift to the right
    if(d>0){
      let rm = newGrid.splice(ei,1);
      newGrid.splice(si,0,rm[0]);
    //otherwise: shift to the left
    } else {
    	let rm = newGrid.splice(si,1);
      newGrid.splice(ei,0,rm[0]);
    }
    return newGrid;
};


  
const gridShiftCol = (origArr, rows, cols, c, d) => {
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
    return newGrid;
  };

const getMisplacedTiles = (act,exp) => {
	let ret = [];
	for(let i=0; i<act.length;i++){
  	if(act[i] != exp[i])
    	ret.push(i);
  }
  console.log(`getMisplacedTiles: ${JSON.stringify(ret)}`);
  return ret;
};

function Tile({caption, isMovable, isMisplaced}){
  
  const actClassNames = () => "tile" + " " 
  		+ (isMovable ? "tile-movable" : "tile-frozen") + " " 
  		+ (isMisplaced ? "tile-misplaced" : "")
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

function Board({rows, cols, tiles, solution}){

	const [tileGrid, setTileGrid] = useState(tiles);
	const [misPlaced, setMisPlaced] = useState( getMisplacedTiles(tileGrid,solution) );

	const shiftRow = (r, d) => {
  	const newGrid = gridShiftRow(tileGrid, parseInt(rows), parseInt(cols), r, d);
    setMisPlaced(getMisplacedTiles(newGrid,solution));
    setTileGrid( newGrid );
  };
  
  const shiftCol = (c, d) => {
  	const newGrid = gridShiftCol(tileGrid, parseInt(rows), parseInt(cols), c, d);
    setMisPlaced(getMisplacedTiles(newGrid,solution));
    setTileGrid( newGrid );
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
    if(c==0){
    	//shift left
      caption = '\u21d0';
      dir = -1;
      cbk = shiftRow;
      idx = r-1;
    } else if(c==(parseInt(cols)+1)) {
    	//shift right
      caption = '\u21d2';
      dir = 1;
      cbk = shiftRow;
      idx = r-1;
    } else if(r==(parseInt(rows)+1)) {
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

  const getTile = (c,m,i) => {
  	let b = misPlaced.includes(i);
    if(b)console.log(`getTile ${i}->${b}`);
    return (
        <td key={'c'+i}>
          <Tile caption={c} isMovable={m} isMisplaced={b} />
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
        ret.push( getTile(tileGrid[i], true, i) );
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
  <table><tbody>
    {genRows()}
  </tbody></table>
  );
}

function TestApp1({rows, cols}){
  
  //create and randomize grid
  const initGrid = Array.from({length: parseInt(rows)*parseInt(cols)}, (v, i) => (i+1));
  
  let toSolveGrid = initGrid.map(e=>e);
  
  for(let i=0; i<2; i++){
  	let r = Math.random() >= 0.5;
  	let d = Math.random() - 0.5;
    let x = Math.floor(Math.random() * ( (r ? parseInt(rows) : parseInt(cols))));
    let fun = r ? gridShiftRow : gridShiftCol;
    toSolveGrid = fun(toSolveGrid, parseInt(rows), parseInt(cols), x, d);
  }
  
  
	const [tileGrid, setTileGrid] = useState(toSolveGrid);
  

  return (
  <Board 
rows={rows}
cols={cols}
tiles={tileGrid}
solution={initGrid}
/>
  );
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<TestApp1 
rows="3"
cols="3"
/>);
