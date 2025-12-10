
// Simple stack to manage modal stacking order
class ModalStack {
  private stack: string[] = []

  push(id: string) {
    this.stack.push(id)
  }

  pop(id: string) {
    this.stack = this.stack.filter((itemId) => itemId !== id)
  }

  isTop(id: string) {
    return this.stack.length > 0 && this.stack[this.stack.length - 1] === id
  }
}

export const modalStack = new ModalStack()
