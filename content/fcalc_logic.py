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
  ,"EQU": {"k":"EQU","p":10,"s":"=","t":"equ"}
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
    ,"EQU": False
    ,"RESULT": ""
    ,"EXPRESSION": ""
    ,"STATE": "type something!"
  }

def add_symbol(sym, numliteral):
  global state, symlist
  
  # print(f"addsymbol: {sym}:p{symbols[sym]['p']}, lit: {numliteral}")
  
  # tolerate (and correct) some malformed expressions
  append_sym = True
  if sym != "NUMBER" and symbols[sym]["t"] == "fn" and state["RESULT"] != "":
    # we assume the User wants to evaluate this function with the previous result
    # FN ( . ) added
    symlist.insert(0, get_symbol('OB'))
    symlist.insert(0, get_symbol(sym))
    symlist.append(get_symbol('CB'))
    append_sym = False
    print(f"add_symbol spec #1 : {symlist_to_string(symlist)}")
  if sym == "CB" and state["RESULT"] != "":
    # we assume the User wants to put the previous expression into brackets
    # ( . ) added
    symlist.insert(0, get_symbol('OB'))
    symlist.append(get_symbol('CB'))
    append_sym = False
    print(f"add_symbol spec #2 : {symlist_to_string(symlist)}")
  elif sym != "NUMBER" and symbols[sym]["t"] != "fn" and not state[sym]:
    # no idea what the user might have wanted
    print(f"  unexpected symbol {sym}, do nothing")
    return
  
  # add to the operational (+ eventually bracket) stack
  expr_res = None # {state, value}
  if append_sym:
    expr_res = handle_symbol(sym, numliteral)
  else:
    expr_res = eval_symlist()
    
  # print(f"  expr_res: {expr_res}")
    
  # expression
  state["EXPRESSION"] = symlist_to_string(symlist)
    
  # decide on button states
  calc_state()
  
  # find out if a result is available
  if expr_res["state"] == "empty":
    state["RESULT"] =""
    state["STATE"] = "type something!"
  elif expr_res["state"] == "malformed expression":
    state["RESULT"] =""
    state["STATE"] = "complete/modify the expression!"
  elif expr_res["state"] == "unexpected value during evaluation":
    state["RESULT"] =""
    state["STATE"] = expr_res["state"]
  else:
    state["RESULT"] = expr_res["value"]
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
    # print(f"brackets: top OB removed -> len={len(brackets)}")
  else:
    brackets.append(sym)
    # print(f"brackets: append {sym} -> len={len(brackets)}")
  
def get_symbol(sym):
  return { "k":symbols[sym]["k"]
          ,"p":symbols[sym]["p"]
          ,"s":symbols[sym]["s"]
          ,"t":symbols[sym]["t"]
  }
  
def handle_symbol(sym, numliteral):
  global opcount, dccount, symlist
  
  sss = symbols[sym]
  
  # count brackets
  if sss["t"] == "bracket":
    handle_brackets(sym)
    
  # expand symlist
  elem = None
  if sss["t"] == "dig":
    # new number
    if len(symlist) == 0 or symlist[-1]["k"] != "NUMBER":
      elem = get_symbol("NUMBER")
    else: # continue last number
      elem = symlist.pop()
    elem["s"] += sss["s"]
    if sss["k"] == "DC":
      dccount = 1
  elif sss["t"] == "number":
    elem = get_symbol("NUMBER")
    elem["s"] = numliteral
  else:
    # simply add to the end and reset the dec.sep. counter
    elem = get_symbol(sym)
    dccount = 0
  
  symlist.append(elem)
  # print(f"handle_symbol: added {elem}")
  
  # operation counter
  if sss["t"] == "fn" or sss["t"] == "inop":
    opcount += 1
    
  # evaluate new symlist
  return eval_symlist() # {state, value}
  
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
    # print(f"to_polish_form :: act={act}")
    if act["t"] == "number":
      polform.append(act)
    else:
      if len(opstack) == 0:
        opstack.append(act)
      elif act["k"] == "OB":
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
        while len(opstack) > 0 and top["p"] >= act["p"] and top["k"] != "OB":
          top = opstack.pop()
          polform.append(top)
          if len(opstack) > 0:
            top = opstack[-1]
          else:
            top = None
          
        opstack.append(act)
    # print(f"to_polish_form: {symlist_to_string(opstack)}  ;  pf={symlist_to_string(polform)}")
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
  elif fn == "DI" and len(arglist) > 1:
    return arglist[0] / arglist[1]
  elif fn == "PO" and len(arglist) > 1:
    return math.pow(arglist[0] , arglist[1])
  else:
    return None

class MalformedExpression(Exception):
    pass

def eval_polish_form(pf):
  args = []
  ptr = 0
  
  while ptr < len(pf):
    act = pf[ptr]
    if act["t"] == "number":
      num = float(act["s"])
      args.append(num)
    elif act["t"] == "fn":
      act1 = args.pop()
      value = eval_fn(act["k"], [act1])
      args.append(value)
    elif act["t"] == "inop":
      act2 = args.pop()
      act1 = args.pop()
      value = eval_inop(act["k"], [act1,act2])
      args.append(value)
    else:
      print(f"  ERR: ptr={ptr} -> type={act['t']}")
      raise MalformedExpression
    print(f"  ptr={ptr} -> args={args}")
    ptr += 1
  
  print(f"eval_polish_form :: args[0]={args[0]}")
  return args[0]

def eval_symlist():
  if len(symlist) == 0:
    return {"state": "empty", "value": None}
    
  if len(symlist) == 1:
    if symlist[-1]["t"] == "number":
      return {"state": "ok", "value": symlist[-1]["s"]}
    else:
      return {"state": "malformed expression", "value": None}
    
  # transform to polish form and evaluate
  val = None
  error = ""
  try:
    pf = to_polish_form(symlist)
    print(f"pf: {symlist_to_string(pf)}")
    val = eval_polish_form(pf)
  except ZeroDivisionError:
    val = None
    error = "unexpected value during evaluation"
  except ValueError:
    val = None
    error = "unexpected value during evaluation"
  except IndexError:
    val = None
    error = "malformed expression"
  except MalformedExpression:
    val = None
    error = "malformed expression"
  finally:
    if error != "":
      return {"state": error, "value": None}
    else:
      return {"state": "ok", "value": val}
  
def calc_state():
  global state
  # empty stack
  if len(symlist) == 0:
    enable_symbol(["OB","SQ","LN","MI"] + all_digs)
    disable_symbol(["CB"] + all_ops)
    # print("  calc_state: stack is empty")
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
      # enable operators + functions + closing bracket
      enable_symbol(["CB","EQU"] + all_ops + all_fns)
      disable_symbol(["OB"])
    elif tpt == "fn" or tpt == "inop":
      enable_symbol(["OB"] + all_digs + all_fns)
      disable_symbol(["CB","EQU"] + all_ops)
    elif tpk == "CB":
      # no immediate opening bracket or number may follow
      disable_symbol(["OB"] + all_digs)
      enable_symbol(["CB","EQU"] + all_ops + all_fns)
    elif tpk == "OB":
      # all symbols enabled except for closing bracket
      enable_symbol(["OB"] + all_ops + all_fns + all_digs)
      disable_symbol(["OB","EQU"])
  
  # special care for closing brackets: enable only when at least one is open
  # --> finally omitted since we want to enable user to post-bracket the entire expression
  #if len(brackets) > 0 and tpk != "OB":
  #  state["CB"] = True
  #  #print("CB -> True")
  #else:
  #  state["CB"] = False
    #print("CB -> False")
  
  # special care for decimal separator
  # --> finally delegated to the front-end
  #if dccount > 0:
  #   disable_symbol(["DC"])
  
  
  
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
  print(f"EXPR: {state['EXPRESSION']} --> {state['RESULT']} --> state: {state['STATE']}")
  print(f"enabled: {','.join(e)} , disabled: {','.join(d)}")

#tests
def tst_polform():
  lst = [ {"k":"SQ","p":4,"s":"&sqrt;","t":"fn"}
         ,{"k":"OB","p":3,"s":"(","t":"bracket"}
         ,{"k":"OB","p":3,"s":"(","t":"bracket"}
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
         ,{"k":"CB","p":3,"s":")","t":"bracket"}
         ,{"k":"MU","p":2,"s":"*","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"2","t":"number"}
         ,{"k":"MI","p":1,"s":"-","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,{"k":"CB","p":3,"s":")","t":"bracket"}
         ,{"k":"DI","p":2,"s":"/","t":"inop"}
         ,{"k":"OB","p":3,"s":"(","t":"bracket"}
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,{"k":"MI","p":1,"s":"-","t":"inop"}
         ,{"k":"NUMBER","p":0,"s":"4","t":"number"}
         ,{"k":"CB","p":3,"s":")","t":"bracket"}
         ,{"k":"CB","p":3,"s":")","t":"bracket"}
        ]
        
  print(f"orig: {symlist_to_string(lst)}")
  pf = to_polish_form(lst)
  print(f"pf: {symlist_to_string(pf)}")
  val = eval_polish_form(pf)
  print(f"val: {val}")

def tst_divbyzero():
  lst = [ {"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,symbols["DI"]
         ,{"k":"NUMBER","p":0,"s":"0","t":"number"}
        ]
    
  val = None
  error = ""
  print(f"orig: {symlist_to_string(lst)}")
  pf = to_polish_form(lst)
  print(f"pf: {symlist_to_string(pf)}")
  try:
    val = eval_polish_form(pf)
  except ZeroDivisionError:
    val = None
    error = "unexpected value during evaluation"
  except ValueError:
    val = None
    error = "unexpected value during evaluation"
  except IndexError:
    val = None
    error = "malformed expression"
  
  print(f"val: {val}, error: {error}")

def tst_malformed1():
  lst = [ symbols["OB"]
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,symbols["PL"]
         ,symbols["CB"]
        ]
    
  val = None
  error = ""
  print(f"orig: {symlist_to_string(lst)}")
  pf = to_polish_form(lst)
  print(f"pf: {symlist_to_string(pf)}")
  try:
    val = eval_polish_form(pf)
  except ZeroDivisionError:
    val = None
    error = "unexpected value during evaluation"
  except ValueError:
    val = None
    error = "unexpected value during evaluation"
  except IndexError:
    val = None
    error = "malformed expression"
  
  print(f"val: {val}, error: {error}")

def tst_malformed2():
  lst = [ symbols["CB"]
         ,{"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,symbols["PL"]
         ,{"k":"NUMBER","p":0,"s":"2","t":"number"}
        ]
    
  val = None
  error = ""
  print(f"orig: {symlist_to_string(lst)}")
  pf = to_polish_form(lst)
  print(f"pf: {symlist_to_string(pf)}")
  try:
    val = eval_polish_form(pf)
  except ZeroDivisionError:
    val = None
    error = "unexpected value during evaluation"
  except ValueError:
    val = None
    error = "unexpected value during evaluation"
  except IndexError:
    val = None
    error = "malformed expression"
  except MalformedExpression:
    val = None
    error = "malformed expression"
  
  print(f"val: {val}, error: {error}")

def tst_malformed3():
  lst = [ {"k":"NUMBER","p":0,"s":"1","t":"number"}
         ,symbols["PL"]
         ,{"k":"NUMBER","p":0,"s":"2","t":"number"}
         ,symbols["CB"]
        ]
    
  val = None
  error = ""
  print(f"orig: {symlist_to_string(lst)}")
  try:
    pf = to_polish_form(lst)
    print(f"pf: {symlist_to_string(pf)}")
    val = eval_polish_form(pf)
  except ZeroDivisionError:
    val = None
    error = "unexpected value during evaluation"
  except ValueError:
    val = None
    error = "unexpected value during evaluation"
  except IndexError:
    val = None
    error = "malformed expression"
  except MalformedExpression:
    val = None
    error = "malformed expression"
  
  print(f"val: {val}, error: {error}")
 
 
def tst_addsym1():
  reset()
  
  lst = [{"sym":"NUMBER","numliteral":"12.3"}
        ,{"sym":"PL","numliteral":None}
        ,{"sym":"NUMBER","numliteral":"2.7"}
        ]
        
  for e in lst:
    add_symbol(e["sym"], e["numliteral"])
    
  print_state()
  
def tst_addsym2():
  reset()
  
  lst = [{"sym":"NUMBER","numliteral":"12.3"}
        ,{"sym":"PL","numliteral":None}
        ,{"sym":"NUMBER","numliteral":"3.7"}
        ,{"sym":"SQ","numliteral":None}
        ]
        
  for e in lst:
    add_symbol(e["sym"], e["numliteral"])
    
  print_state()
  
def tst_addsym3():
  reset()
  
  lst = [{"sym":"NUMBER","numliteral":"12.3"}
        ,{"sym":"PL","numliteral":None}
        ,{"sym":"NUMBER","numliteral":"3.7"}
        ,{"sym":"CB","numliteral":None}
        ,{"sym":"MU","numliteral":None}
        ,{"sym":"NUMBER","numliteral":"2"}
        ]
        
  for e in lst:
    add_symbol(e["sym"], e["numliteral"])
    
  print_state()
    
    
tst_addsym3()
#tst_addsym2()
#tst_addsym1()
         
#tst_malformed3()
#tst_malformed2()
#tst_malformed1()
#tst_divbyzero()
#tst_polform()

#reset()
#add_symbol("OB")
#add_symbol("B2")
#add_symbol("DC")
#add_symbol("B2")
#add_symbol("CB")
#print(symlist_to_string())
