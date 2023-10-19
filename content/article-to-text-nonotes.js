
/* example: https://www.cairn.info/revue-guerres-mondiales-et-conflits-contemporains-2001-2-page-167.htm */

function getHeader(ndRoot, headLevel){
	return '<h' + (headLevel+1) + '>' + ndRoot.textContent + '</h' + (headLevel+1) + '>';
}
function getPara(ndRoot){
	return '<p>' 
			+ Array.from(ndRoot.childNodes)
				.filter(n=>(n.nodeName=='SPAN' || n.nodeType==3))
				.map(n=>n.textContent)
				.join('')
			+ '</p>';
}
function getSection(ndRoot, headLevel){
	
	let chd = Array.from(ndRoot.childNodes)
				.filter(n=>(   n.nodeName=='H1' 
							|| n.nodeName=='H2' 
							|| n.nodeName=='H3' 
							|| n.nodeName=='H4' 
							|| n.nodeName=='H5' 
							|| n.nodeName=='P' 
							|| n.nodeName=='SECTION'
							)
						)
				;
				
	return chd.map(n=>{
		if(n.nodeName=='H1' || n.nodeName=='H2' || n.nodeName=='H3' || n.nodeName=='H4' || n.nodeName=='H5' ){
			return getHeader(n, headLevel);
		} else if(n.nodeName=='P') {
			return getPara(n);
		} else if(n.nodeName=='SECTION') {
			return getSection(n, headLevel+1);
		}
	}).join('\n');
}

/*
usage: getSection( document.getElementById('s1n1') ,1)
*/
