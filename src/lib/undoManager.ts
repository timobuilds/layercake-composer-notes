interface UndoAction {
  type: 'move' | 'create' | 'delete' | 'edit';
  nodeId: string;
  timestamp: number;
  data: {
    // For move operations
    oldParentId?: string | null;
    newParentId?: string | null;
    oldOrder?: number;
    newOrder?: number;
    // For other operations (future extensibility)
    oldContent?: string;
    newContent?: string;
    deletedNode?: any;
  };
}

class UndoManager {
  private history: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private maxHistorySize = 50;

  recordMove(nodeId: string, oldParentId: string | null, newParentId: string | null, oldOrder?: number, newOrder?: number) {
    const action: UndoAction = {
      type: 'move',
      nodeId,
      timestamp: Date.now(),
      data: {
        oldParentId,
        newParentId,
        oldOrder,
        newOrder
      }
    };

    this.addAction(action);
  }

  recordEdit(nodeId: string, oldContent: string, newContent: string) {
    const action: UndoAction = {
      type: 'edit',
      nodeId,
      timestamp: Date.now(),
      data: {
        oldContent,
        newContent
      }
    };

    this.addAction(action);
  }

  recordCreate(nodeId: string, parentId: string | null, content: string) {
    const action: UndoAction = {
      type: 'create',
      nodeId,
      timestamp: Date.now(),
      data: {
        newParentId: parentId,
        newContent: content
      }
    };

    this.addAction(action);
  }

  recordDelete(nodeId: string, deletedNode: any) {
    const action: UndoAction = {
      type: 'delete',
      nodeId,
      timestamp: Date.now(),
      data: {
        deletedNode
      }
    };

    this.addAction(action);
  }

  private addAction(action: UndoAction) {
    this.history.push(action);
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getLastAction(): UndoAction | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  undo(): UndoAction | null {
    const action = this.history.pop();
    if (action) {
      this.redoStack.push(action);
      return action;
    }
    return null;
  }

  redo(): UndoAction | null {
    const action = this.redoStack.pop();
    if (action) {
      this.history.push(action);
      return action;
    }
    return null;
  }

  clear() {
    this.history = [];
    this.redoStack = [];
  }
}

export const undoManager = new UndoManager();
export type { UndoAction };