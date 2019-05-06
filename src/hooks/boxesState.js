export const boxWidth = 200;
export const boxHeight = 70;

export const initialState = {
  boxes: [],
  selectedIndex: -1,
  editMode: false
};

export const createBoxesAction = createAction("CREATE_BOXES");
export const selectBoxAtPointAction = createAction("SELECT_BOX_AT_POINT");
export const moveBoxAction = createAction("MOVE_BOX");
export const setBoxEditModeAction = createAction("SET_BOX_EDIT_MODE");
export const updateSelectedBoxAction = createAction("UPDATE_SELECT_BOX");

export const reducer = createReducer([
  [
    createBoxesAction,
    (state, action) => {
      const { count, width, height } = action.payload;
      const boxes = new Array(count).fill(0).map((v, idx) => ({
        id: `box-${idx + 1}`,
        top: Math.random() * (height - boxHeight),
        left: Math.random() * (width - boxWidth),
        width: boxWidth,
        height: boxHeight,
        text: `Box ${idx + 101}`
      }));
      return { ...state, boxes };
    }
  ],
  [
    selectBoxAtPointAction,
    (state, action) => {
      const { x, y } = action.payload;
      const selectedIndex = state.boxes.reduce((foundIndex, box, idx) => {
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
      return { ...state, selectedIndex };
    }
  ],
  [
    moveBoxAction,
    (state, action) => {
      const { boxes, selectedIndex } = state;
      if (selectedIndex === -1) {
        return state;
      }

      const { x, y, offsetX, offsetY } = action.payload;
      const updatedBox = {
        ...boxes[selectedIndex],
        left: x - offsetX,
        top: y - offsetY
      };
      return {
        ...state,
        boxes: boxes.map((box, idx) =>
          idx === selectedIndex ? updatedBox : box
        )
      };
    }
  ],
  [
    setBoxEditModeAction,
    (state, action) => {
      const { editMode } = action.payload;
      return { ...state, editMode };
    }
  ],
  [
    updateSelectedBoxAction,
    (state, action) => {
      const { boxes, selectedIndex } = state;
      if (selectedIndex === -1) {
        return state;
      }

      const { box: updatedBox } = action.payload;
      return {
        ...state,
        boxes: boxes.map((box, idx) =>
          idx === selectedIndex ? updatedBox : box
        )
      };
    }
  ]
]);

function createAction(type) {
  function actionCreator(payload) {
    return {
      type,
      payload
    };
  }
  actionCreator.toString = () => type;
  return actionCreator;
}

function createReducer(handlers) {
  const map = new Map(
    handlers.map(([ac, handler]) => [ac.toString(), handler])
  );
  return (state, action) => {
    const handler = map.get(action.type) || (() => state);
    return handler(state, action);
  };
}
