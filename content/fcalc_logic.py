# Online Python - IDE, Editor, Compiler, Interpreter

maxopnum = 20   # max number of operators

state = {}      # state
symlist = []    # symbols as typed by the user
opstack = []    # operational stack 
brackets = []   # separate stack to ensure proper bracketing
opcount = 0     # number of operators in stack

# p: precedence, s: symbol, t: type, v: value
# dig: digit, inop: inorder operator, fn: function
symbols = {
   "B0": {"p":0,"s":"0","t":"dig"}
  ,"B1": {"p":0,"s":"1","t":"dig"}
  ,"B2": {"p":0,"s":"2","t":"dig"}
  ,"B3": {"p":0,"s":"3","t":"dig"}
  ,"B4": {"p":0,"s":"4","t":"dig"}
  ,"B5": {"p":0,"s":"5","t":"dig"}
  ,"B6": {"p":0,"s":"6","t":"dig"}
  ,"B7": {"p":0,"s":"7","t":"dig"}
  ,"B8": {"p":0,"s":"8","t":"dig"}
  ,"B9": {"p":0,"s":"9","t":"dig"}
  ,"OB": {"p":3,"s":"(","t":"bracket"}
  ,"CB": {"p":3,"s":")","t":"bracket"}
  ,"MU": {"p":2,"s":"*","t":"inop"}
  ,"DI": {"p":2,"s":"/","t":"inop"}
  ,"PL": {"p":2,"s":"+","t":"inop"}
  ,"MI": {"p":2,"s":"-","t":"inop"}
  ,"PO": {"p":4,"s":"^","t":"inop"}
  ,"LN": {"p":4,"s":"LN","t":"fn"}
  ,"SQ": {"p":4,"s":"&sqrt;","t":"fn"}
  ,"DC": {"p":0,"s":".","t":"dig"}
  ,"NUMBER": {"p":0,"s":"","t":"number"}
}

# further helpers
all_inops_fns = []
all_digs = []
all_ops = []
all_fns = []
for x in symbols.keys():
  if (x["t"] == "inop" and x != "MI") or x["t"] == "fn":
    all_inops_fns.append(x)
  if x["t"] == "dig":
    all_digs.append(x)
  if x["t"] == "inop":
    all_ops.append(x)
  if x["t"] == "fn":
    all_fns.append(x)


def symlist_to_string():
  if symlist == None or len(symlist) == 0:
    return ""
    
  tmp = []
  num = ""
  for s in symlist:
    if symbols[s]["t"] == "dig":
      num = num + symbols[s]["s"]
    else:
      if num:
        tmp.append(num)
        num = ""
      tmp.append(symbols[s]["s"])
        
  if num:
    tmp.append(num)
    
  return " ".join(tmp)

def reset():
  symlist = [] 
  opstack = [] 
  brackets = []
  opcount = 0  
  numcoll = ""

  state = {
     "B0": True, "B1": True, "B2": True
    ,"B3": True, "B4": True, "B5": True
    ,"B6": True, "B7": True, "B8": True
    ,"B9": True
    ,"OB": True, "CB": False
    ,"MU": False, "DI": False, "PL": False, "MI": False
    ,"PO": False, "LN": True, "SQ": True, "DC": True
    ,"RESULT": ""
    ,"EXPRESSION": ""
    ,"STATE": "type something!"
  }

def add_symbol(sym):
  print(f"addsymbol: {sym}:p{symbols[sym]["p"]}, top: {opstack.top()}:p{symbols[opstack.top()]["p"]}")
  
  # reject unexpected symbol and quit
  if not state[sym]:
    print(f"  unexpected symbol, do nothing")
    return
  
  # add to symlist
  symlist.append(sym)
  
  # add to operational + eventually bracket stack
  handle_symbol(sym)
  
  # find out if a result is available
  if len(opstack) == 1 and opstack.top() == "NUMBER":
    state["RESULT"] = opstack.top()["s"]
    state["STATE"] = "result"
  else:
    if len(opstack) == 0:
      state["STATE"] = "type something!"
    else:
      state["STATE"] = "result"
    state["RESULT"] = ""
    
  # expression
  state["EXPRESSION"] = symlist_to_string()
    
  # decide on state
  calc_state()
  
def enable_symbol(symarr):
  for s in symarr:
    state[s] = True
  
def disable_symbol(symarr):
  for s in symarr:
    state[s] = False
    
def handle_symbol(sym):
  # TBD
  return
  
def calc_state(sym):
  # empty stack
  if len(opstack) == 0
    enable_symbol(["OB","SQ","LN","MI"] + all_digs)
    disable_symbol(["CB"] + all_ops)
    return
    
  # max number of operators reached => disable further operators, functions and opening brackets
  if opcount >= maxopnum:
    disable_symbol(["OB","MI"] + all_inops_fns)
    enable_symbol(["CB"] + all_digs)
  else: # at least one element in stack
    tp = opstack.top()
    tpt = tp["t"]
    if tpt == "dig":
      enable_symbol(symbols.keys())
    elif tpt == "fn" or tpt == "inop":
      enable_symbol(["OB"] + all_digs + all_fns)
      disable_symbol(["CB"] + all_ops)
  
  # special care for closing brackets: enable only when at least one is open
  if len(brackets) > 0:
    state["CB"] = True
  else:
    state["CB"] = False
  
  
# test definitions
def tst_symlist_to_string():
  reset()
  symlist = ["OB","B1","B2","PL","B3","DC","B9","CB","PO","B2","MI","B2","DC","B0"]
  print(symlist_to_string())



#tests
tst_symlist_to_string()

