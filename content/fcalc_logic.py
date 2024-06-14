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
  if (symbols[x]["t"] == "inop" and x != "MI") or symbols[x]["t"] == "fn":
    all_inops_fns.append(x)
  if symbols[x]["t"] == "dig":
    all_digs.append(x)
  if symbols[x]["t"] == "inop":
    all_ops.append(x)
  if symbols[x]["t"] == "fn":
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
  global symlist, opstack, brackets, opcount, numcoll, state
  
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
  global symlist, state
  
  print(f"addsymbol: {sym}:p{symbols[sym]['p']}")
  
  # reject unexpected symbol and quit
  if not state[sym]:
    print(f"  unexpected symbol, do nothing")
    return
  
  # add to symlist
  symlist.append(sym)
  
  # add to operational + eventually bracket stack
  handle_symbol(sym)
  
  # find out if a result is available
  if len(opstack) == 1 and opstack[-1] == "NUMBER":
    state["RESULT"] = opstack[-1]["s"]
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
  global state
  for s in symarr:
    state[s] = True
  
def disable_symbol(symarr):
  global state
  for s in symarr:
    state[s] = False
    
def handle_brackets(sym):
  global brackets
  if len(brackets) > 0 and  brackets[-1] == "OB" and sym == "CB":
    brackets.pop()
    print(f"brackets: top OB removed -> len={len(brackets)}")
  else:
    brackets.append(sym)
    print(f"brackets: append {sym} -> len={len(brackets)}")
  
def handle_symbol(sym):
  # TBD correctly. For the sake of testing, just put the symbol in
  opstack.append(sym)
  if sym == "OB" or sym == "CB":
    handle_brackets(sym)
  
def calc_state():
  global state
  # empty stack
  if len(opstack) == 0:
    enable_symbol(["OB","SQ","LN","MI"] + all_digs)
    disable_symbol(["CB"] + all_ops)
    return
    
  # max number of operators reached => disable further operators, functions and opening brackets
  if opcount >= maxopnum:
    disable_symbol(["OB","MI"] + all_inops_fns)
    enable_symbol(["CB"] + all_digs)
  else: # at least one element in stack
    last = opstack[-1]
    tp = symbols[last]
    tpt = tp["t"]
    if tpt == "dig":
      enable_symbol(symbols.keys())
    elif tpt == "fn" or tpt == "inop":
      enable_symbol(["OB"] + all_digs + all_fns)
      disable_symbol(["CB"] + all_ops)
    elif last == "CB":
      disable_symbol(["OB"] + all_digs + all_fns)
      enable_symbol(["CB"] + all_ops)
  
  # special care for closing brackets: enable only when at least one is open
  if len(brackets) > 0 and opstack[-1] != "OB":
    state["CB"] = True
    print("CB -> True")
  else:
    state["CB"] = False
    print("CB -> False")
  
  
# test definitions
def tst_symlist_to_string():
  reset()
  symlist = ["OB","B1","B2","PL","B3","DC","B9","CB","PO","B2","MI","B2","DC","B0"]
  print(symlist_to_string())

def print_state():
  e = []
  d = []
  for k in state.keys():
    if k != "STATE" and k != "RESULT" and k != "EXPRESSION":
      if state[k]:
        e.append(k)
      else:
        d.append(k)
  print(f"enabled: {','.join(e)} , disabled: {','.join(d)}")

#tests
reset()
add_symbol("OB")
add_symbol("B2")
add_symbol("CB")
print_state()
