/* example: https://www.cairn.info/revue-guerres-mondiales-et-conflits-contemporains-2001-2-page-167.htm */

function getHeader(ndRoot, headLevel){
	return '<h' + (headLevel+1) + '>' + ndRoot.textContent + '</h' + (headLevel+1) + '>';
}
function quoteText(ndQuote){
	let nd = Array.from(ndQuote.childNodes).filter(e=>e.nodeName=='DIV')[0];
	nd = Array.from(nd.childNodes).filter(e=>e.nodeType==3);
	return '<p>"' + getItalic( nd.map(e=>e.textContent).join('') ) + '"</p>';
}
function getItalic(txt){
	return '<i>' + txt + '</i>';
}
function getPara(ndRoot){
	return '<p>' 
			+ Array.from(ndRoot.childNodes)
				.filter(n=>(n.nodeName=='SPAN' || n.nodeName=='EM' || n.nodeType==3 ))
				.map(n=> {
						if (n.nodeName=='EM'){
							return getItalic(n.textContent);
						} else return n.textContent;
					}
				)
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
							|| n.nodeName=='BLOCKQUOTE'
							)
						)
				;
				
	return chd.map(n=>{
		if(n.nodeName=='H1' || n.nodeName=='H2' || n.nodeName=='H3' || n.nodeName=='H4' || n.nodeName=='H5' ){
			return getHeader(n, headLevel);
		} else if(n.nodeName=='P') {
			return getPara(n);
		} else if(n.nodeName=='BLOCKQUOTE') {
			return quoteText(n);
		} else if(n.nodeName=='SECTION') {
			return getSection(n, headLevel+1);
		}
	}).join(' ');
}

/*
usage: getSection( document.getElementById('s1n1') ,1)
*/


function getAllSections(){
	//Assumptions:
	//  1) there always exists a section with id='s1n1'
	//  2) sections to be visited (recursively) are s1n1 and its siblings
	
	return Array.from(document.getElementById('s1n1').parentNode.childNodes)
	          .map(n=>getSection(n,1))
			  .join('\n')
			  ;
}

/* returns the content of an entire CAIRN article
usage: getAllSections()
*/
