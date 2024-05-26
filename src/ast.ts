export type Token = {
  type: 'OPERAND' | 'OPERATOR' | 'LPAREN' | 'RPAREN',
  value: string
};

export class ASTNode {
  token: Token;
  left?: ASTNode;
  right?: ASTNode;

  constructor(token: Token) {
    this.token = token;
    this.left;
    this.right;
  }
}

// Shunting Yard Algorithm
export const shuntingYard = (tokens: Token[]): Token[] => {
  const output: Token[] = [];
  const operators: Token[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "OPERAND":
        output.push(token);
        break;
      case "OPERATOR":
        // special case for complement operator
        if (token.value === 'c') {
          operators.push(token);
          break;
        }
        while (operators.length && operators[operators.length - 1].type === "OPERATOR") {
          output.push(operators.pop()!);
        }
        operators.push(token);
        break;
      case "LPAREN":
        operators.push(token);
        break;
      case "RPAREN":
        while (operators.length && operators[operators.length - 1].type !== "LPAREN") {
          output.push(operators.pop()!);
        }
        operators.pop()
        break;
    }
  }

  while (operators.length) {
    output.push(operators.pop()!);
  }

  return output;
};

export const buildAST = (postfix: Token[]): ASTNode => {
  const stack: ASTNode[] = [];

  for (const token of postfix) {
    if (token.type === "OPERAND") {
      stack.push(new ASTNode(token));
    } else if (token.type === "OPERATOR") {
      const node = new ASTNode(token);
      if (token.value === 'c') {
        node.left = stack.pop();
      } else {
        node.right = stack.pop();
        node.left = stack.pop();
      }
      stack.push(node);
    }
  }

  return stack[0];
};

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = [];
  const regex = /\s*(\^c|[a-zA-Z]+|[0|1|2|/]|[()])\s*/g;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match[1] === '^c') {
      tokens.push({ type: 'OPERATOR', value: 'c' });
    } else if (/[a-zA-Z]+/.test(match[1])) {
      tokens.push({ type: 'OPERAND', value: match[1] });
    } else if (/[0|1|2|/]/.test(match[1])) {
      tokens.push({ type: 'OPERATOR', value: match[1] });
    } else if (match[1] === '(') {
      tokens.push({ type: 'LPAREN', value: match[1] });
    } else if (match[1] === ')') {
      tokens.push({ type: 'RPAREN', value: match[1] });
    }
  }

  return tokens;
}

const expressionToAST = (expression: string): ASTNode => {
  const tokens = tokenize(expression);
  const postfix = shuntingYard(tokens);
  return buildAST(postfix);
}

export {
  expressionToAST
};