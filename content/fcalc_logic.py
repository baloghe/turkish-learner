# Online Python - IDE, Editor, Compiler, Interpreter

import math

maxopnum = 20   # max number of operators

state = {}      # state
symlist = []    # symbols as typed by the user
brackets = []   # separate stack to ensure proper bracketing
opcount = 0     # number of operators in stack
dccount = 0     # number of decimal points in the current number literal

# k: key, p: precedence, s: symbol, t: type, v: value
# dig: digit, inop: inorder operator, fn: function
symbols = {
   "B0": {"k":"B0","p":0,"s":"0","t":"dig"}
  ,"B1": {"k":"B1","p":0,"s":"1","t":"dig"}
  ,"B2": {"k":"B2","p":0,"s":"2","t":"dig"}
  ,"B3": {"k":"B3","p":0,"s":"3","t":"dig"}
  ,"B4": {"k":"B4","p":0,"s":"4","t":"dig"}
  ,"B5": {"k":"B5","p":0,"s":"5","t":"dig"}
  ,"B6": {"k":"B6","p":0,"s":"6","t":"dig"}
  ,"B7": {"k":"B7","p":0,"s":"7","t":"dig"}
  ,"B8": {"k":"B8","p":0,"s":"8","t":"dig"}
  ,"B9": {"k":"B9","p":0,"s":"9","t":"dig"}
  ,"OB": {"k":"OB","p":3,"s":"(","t":"bracket"}
  ,"CB": {"k":"CB","p":3,"s":")","t":"bracket"}
  ,"MU": {"k":"MU","p":2,"s":"*","t":"inop"}
  ,"DI": {"k":"DI","p":2,"s":"/","t":"inop"}
  ,"PL": {"k":"PL","p":1,"s":"+","t":"inop"}
  ,"MI": {"k":"MI","p":1,"s":"-","t":"inop"}
  ,"PO": {"k":"PO","p":4,"s":"^","t":"inop"}
  ,"LN": {"k":"LN","p":4,"s":"LN","t":"fn"}
  ,"SQ": {"k":"SQ","p":4,"s":"&sqrt;","t":"fn"}
  ,"DC": {"k":"DC","p":0,"s":".","t":"dig"}
  ,"NUMBER": {"k":"NUMBER","p":0,"s":"","t":"number"}
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


def symlist_to_string(slist):
  if slist == None or len(slist) == 0:
    return ""
    
  tmp = []
  for e in slist:
    tmp.append(e["s"])
  
  return " ".join(tmp)

def reset():
  global symlist, brackets, opcount, numcoll, state
  
  symlist = []
  brackets = []
  opcount = 0
  dccount = 0

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
  global state
  
  print(f"addsymbol: {sym}:p{symbols[sym]['p']}")
  
  # reject unexpected symbol and quit
  if not state[sym]:
    print(f"  unexpected symbol, do nothing")
    return
  
  # add to operational + eventually bracket stack
  handle_symbol(sym)
    
  # expression
  state["EXPRESSION"] = symlist_to_string(symlist)
    
  # decide on state
  calc_state()
  print_state()
  
  # find out if a result is available
  r = eval_stack()
  if r["state"] == "empty":
    state["RESULT"] =""
    state["STATE"] = "type something!"
  elif r["state"] == "error":
    state["RESULT"] =""
    state["STATE"] = "complete the expression!"
  else:
    state["RESULT"] = r["value"]
    state["STATE"] = "result"
  
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
  
def get_symbol(sym):
  return { "k":symbols[sym]["k"]
          ,"p":symbols[sym]["p"]
          ,"s":symbols[sym]["s"]
          ,"t":symbols[sym]["t"]
  }
  
def handle_symbol(sym):
  global opcount, dccount, symlist
  
  sss = symbols[sym]
  
  # count brackets
  if sss["t"] == "bracket":
    handle_brackets(sym)
    
  # operational stack
  elem = None
  if sss["t"] == "dig":
    if len(symlist) == 0 or symlist[-1]["k"] != "NUMBER":
      elem = get_symbol("NUMBER")
    else:
      elem = symlist.pop()
    elem["s"] += sss["s"]
    if sss["k"] == "DC":
      dccount = 1
  else:
    elem = get_symbol(sym)
    dccount = 0
  
  symlist.append(elem)
  
  # operation counter
  if sss["t"] == "fn" or sss["t"] == "inop":
    opcount += 1
  
def copy_stack():
  ret = []
  for e in symlist:
    elem = { "k":e["k"]
          ,"p":e["p"]
          ,"s":e["s"]
          ,"t":e["t"]
    }
    ret.append(elem)
  return ret

def to_polish_form(slist):
  error = 0
  polform = []
  opstack = []
  ptr = 0
  while ptr < len(slist) and error == 0:
    act = slist[ptr]
    if act["t"] == "number":
      polform.append(act)
    else:
      if len(opstack) == 0:
        opstack.append(act)
      elif act["k"] == "CB":
        oppop = opstack.pop()
        while oppop["k"] != "OB":
          polform.append(oppop)
          oppop = opstack.pop()
      elif act["p"] > opstack[-1]["p"]:
        opstack.append(act)
      else:
        top = opstack[-1]
        while top["p"] >= act["p"] and len(opstack) > 0:
          top = opstack.pop()
          polform.append(top)
          
        opstack.append(act)
    ptr += 1
  
  while len(opstack) > 0:
    oppop = opstack.pop()
    polform.append(oppop)
    
  return polform

def eval_fn(fn, arglist):
  if fn == "LN" and len(arglist) > 0 and arglist[0] > 0:
    return math.log(arglist[0])
  elif fn == "SQ" and len(arglist) > 0 and arglist[0] >= 0:
    return math.sqrt(arglist[0])
  else:
    return None
    
def eval_inop(fn, arglist):
  if fn == "PL" and len(arglist) > 1:
    return arglist[0] + arglist[1]
  elif fn == "MI" and len(arglist) > 1:
    return arglist[0] - arglist[1]
  elif fn == "MU" and len(arglist) > 1:
    return arglist[0] * arglist[1]
  elif fn == "DI" and len(arglist) > 1 and arglist[1] != 0:
    return arglist[0] / arglist[1]
  elif fn == "PO" and len(arglist) > 1:
    return math.pow(arglist[0] , arglist[1])
  else:
    return None

def eval_polish_form(pf):
  args = []
  ptr = 0
  while ptr < len(pf):
    act = pf[ptr]
    if act["t"] == "number":
      num = float(act["s"])
      args.append(num)
    elif act["t"] == "fn":
      act = args.pop()
      value = eval_fn(act["k"], [act])
      args.append(value)
    elif act["t"] == "inop":
      act2 = args.pop()
      act1 = args.pop()
      value = eval_inop(act["k"], [act1,act2])
      args.append(value)
    else:
      print(f"  ERR: ptr={ptr} -> type={act['t']}")
    print(f"  ptr={ptr} -> args={args}")
    ptr += 1
  
  return args[0]

def eval_stack():
  if len(symlist) == 0:
    return {"state": "empty", "value": None}
    
  if len(symlist) == 1:
    if symlist[-1]["t"] == "number":
      return {"state": "ok", "value": float(symlist[-1]["s"])}
    else:
      return {"state": "error", "value": None}
    
  # transform to polish form and evaluate
  polform = to_polish_form(symlist)
  
  if error == 1 or scop[-1]["t"] != "number":
    return {"state": "error", "value": None}
  else:
    return {"state": "ok", "value": float(scop[-1]["s"])}
  
def calc_state():
  global state
  # empty stack
  if len(symlist) == 0:
    enable_symbol(["OB","SQ","LN","MI"] + all_digs)
    disable_symbol(["CB"] + all_ops)
    print("  calc_state: stack is empty")
    return
    
  # max number of operators reached => disable further operators, functions and opening brackets
  if opcount >= maxopnum:
    disable_symbol(["OB","MI"] + all_inops_fns)
    enable_symbol(["CB"] + all_digs)
  else: # at least one element in stack
    last = symlist[-1]
    tpt = last["t"]
    tpk = last["k"]
    if tpt == "number":
      enable_symbol(symbols.keys())
      print("  calc_state: everything enabled")
    elif tpt == "fn" or tpt == "inop":
      enable_symbol(["OB"] + all_digs + all_fns)
      disable_symbol(["CB"] + all_ops)
    elif tpk == "CB":
      disable_symbol(["OB"] + all_digs + all_fns)
      enable_symbol(["CB"] + all_ops)
  
  # special care for closing brackets: enable only when at least one is open
  if len(brackets) > 0 and tpk != "OB":
    state["CB"] = True
    #print("CB -> True")
  else:
    state["CB"] = False
    #print("CB -> False")
  
  # special care for decimal separator
  if dccount > 0:
     disable_symbol(["DC"])
  
  
  
# test definitions

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
def tst_polform():
  lst = [ {"k":"OB","p":3,"s":"(","t":"bracket"}
         ,{"k":"OB","p":3,"s":"(","t":"bracket"}
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,{"k":"PL","p":1,"s":"+","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"2","t":"number"}
         ,{"k":"CB","p":3,"s":")","t":"bracket"}
         ,{"k":"MI","p":1,"s":"-","t":"inop"}
         ,{"k":"OB","p":3,"s":"(","t":"bracket"}
         ,{"k":"NUMBER","p":0,"s":"3","t":"number"}
         ,{"k":"PL","p":1,"s":"+","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"4","t":"number"}
         ,{"k":"MU","p":2,"s":"*","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"2","t":"number"}
         ,{"k":"MI","p":1,"s":"-","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,{"k":"CB","p":3,"s":")","t":"bracket"}
         ,{"k":"DI","p":2,"s":"/","t":"inop"}
         ,{"k":"OB","p":3,"s":"(","t":"bracket"}
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,{"k":"PL","p":1,"s":"+","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,{"k":"CB","p":3,"s":")","t":"bracket"}
        ]
        
  print(f"orig: {symlist_to_string(lst)}")
  pf = to_polish_form(lst)
  print(f"pf: {symlist_to_string(pf)}")
  val = eval_polish_form(pf)
  print(f"val: {val}")

tst_polform()

#reset()
#add_symbol("OB")
#add_symbol("B2")
#add_symbol("DC")
#add_symbol("B2")
#add_symbol("CB")
#print(symlist_to_string())
