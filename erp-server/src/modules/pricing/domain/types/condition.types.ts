/**
 * Types for condition expressions and evaluation
 */

export interface PropertyValue {
  propertyId: number;
  value: string;
}

export interface ConditionEvaluationContext {
  propertyValues: Map<number, string>;
  currentDate: Date;
}

// AST Node Types
export type NodeType = 
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_EQUAL'
  | 'LESS_EQUAL'
  | 'LIKE'
  | 'IN'
  | 'BETWEEN'
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'PROPERTY_REF'
  | 'STRING_LITERAL'
  | 'NUMBER_LITERAL';

export interface BaseNode {
  type: NodeType;
}

export interface BinaryOperationNode extends BaseNode {
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryOperationNode extends BaseNode {
  operand: ASTNode;
}

export interface PropertyRefNode extends BaseNode {
  propertyId: number;
}

export interface StringLiteralNode extends BaseNode {
  value: string;
}

export interface NumberLiteralNode extends BaseNode {
  value: number;
}

export interface InNode extends BaseNode {
  property: ASTNode;
  values: ASTNode[];
}

export interface BetweenNode extends BaseNode {
  property: ASTNode;
  min: ASTNode;
  max: ASTNode;
}

export type ASTNode = 
  | BinaryOperationNode
  | UnaryOperationNode
  | PropertyRefNode
  | StringLiteralNode
  | NumberLiteralNode
  | InNode
  | BetweenNode;

export interface ParseResult {
  success: boolean;
  ast?: ASTNode;
  error?: string;
}

export interface EvaluationResult {
  success: boolean;
  value?: boolean;
  error?: string;
}