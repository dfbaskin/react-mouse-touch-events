export const boxWidth = 200;
export const boxHeight = 70;

export const boxesInitialState = {
  boxes: [],
  selectedIndex: -1,
  editMode: false
};

export const boxesMethods = state => ({
  createBoxes({ count, width, height }) {
    state.boxes = new Array(count).fill(0).map((v, idx) => ({
      id: `box-${idx + 1}`,
      top: Math.random() * (height - boxHeight),
      left: Math.random() * (width - boxWidth),
      width: boxWidth,
      height: boxHeight,
      text: `Box ${idx + 101}`
    }));
  },
  selectBoxAtPoint({ x, y }) {
    state.selectedIndex = state.boxes.reduce((foundIndex, box, idx) => {
      const x1 = box.left;
      const x2 = box.left + box.width;
      const y1 = box.top;
      const y2 = box.top + box.height;
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        if (foundIndex === -1 || idx === state.selectedIndex) {
          foundIndex = idx;
        }
      }
      return foundIndex;
    }, -1);
  },
  moveBox({ x, y, offsetX, offsetY }) {
    const { boxes, selectedIndex } = state;
    if (selectedIndex !== -1) {
      boxes[selectedIndex].left = x - offsetX;
      boxes[selectedIndex].top = y - offsetY;
    }
  },
  setBoxEditMode(editMode) {
    state.editMode = editMode;
  },
  updateSelectedBox(box) {
    const { boxes, selectedIndex } = state;
    if (selectedIndex !== -1) {
      boxes[selectedIndex] = box;
    }
  }
});
