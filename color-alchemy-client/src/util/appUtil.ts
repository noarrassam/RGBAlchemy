import { ECellType, EPosition } from "./enums";
import { CellDataType, DataType, EnvDataType, ServerDataType } from "./types";

export class AppUtil {
    public static envVar: EnvDataType;

    static setEnvVaribales() {
      AppUtil.envVar = {
          serverUrl: process.env.REACT_APP_SERVER_URL || "",
          initEndPoint: process.env.REACT_APP_SERVER_INIT_END_POINT || "",
          userEndPoint: process.env.REACT_APP_SERVER_USER_END_POINT || "",
          initialStepCount: Number(process.env.REACT_APP_INITIAL_STEPS_COUNT) || 3,
          borderColor:  process.env.REACT_APP_BORDER_COLOR ? JSON.parse(process.env.REACT_APP_BORDER_COLOR) : [],
          closestColorBorder: process.env.REACT_APP_CLOSEST_COLOR_BORDER ? JSON.parse(process.env.REACT_APP_CLOSEST_COLOR_BORDER) : [],
          delta:  Number(process.env.REACT_APP_DELTA || -1),
          deltaWinCondition:  Number(process.env.REACT_APP_DELTA_WIN_CONDITION || -1)
      }
  }

  //generates initial data for Cell
  static getInitialCellData(initialData: ServerDataType): CellDataType[][] {
      const arrCellData: CellDataType[][] = [];
      const height = initialData.height;
      const width = initialData.width;
      let type: ECellType;
    
      if (height > 0 && width > 0) {
        // adding 2 source circles in calculation
        for (let col = 0; col < height + 2; col++) {
          arrCellData[col] = [];
          // adding 2 source circles in calculation
          for (let row = 0; row < width + 2; row++) {
            // calculate empty cell
            if (row === 0 || col === 0 || row > width || col > height) {
              if ((row === 0 && col === 0) || (row === 0 && col === height + 1) || (row === width + 1 && col === 0) || (row === width + 1 && col === height + 1)) {
                type = ECellType.EMPTY;
              } 
              else {
                type = ECellType.OUTER;
              }
            } 
            else {
              type = ECellType.INNER;
            }
      
            let cell: CellDataType = {
              id: row + "," + col,
              color: [0, 0, 0],
              borderColor: AppUtil.envVar.borderColor,
              type: type,
              movable: false,
            };
      
            arrCellData[col][row] = cell;
          }
        }
        return arrCellData;
      }
      return [];
  };

  static getParsedCellId(cellId: string) {
    const coords = cellId.split(",");
    return {x: parseInt(coords[0]),y: parseInt(coords[1])};
  };

  static getCellPosition(cellId: string, data: DataType){
    const sourcePos = AppUtil.getParsedCellId(cellId);
    let pos: EPosition;

    if (sourcePos.x === 0) {
      pos = EPosition.LEFT;
    } else if (data.initial && sourcePos.x === data.initial.width + 1) {
      pos = EPosition.RIGHT;
    } else if (sourcePos.y === 0) {
      pos = EPosition.TOP;
    } else {
      pos = EPosition.BOTTOM;
    }

    return pos;
  };

  static getDynamicInnerCellColor(color: number[],distance: number,dimension: number): number[]{
    const dim = (dimension + 1 - distance) / (dimension + 1);
    return color.map((item) => {
      return item * dim;
    });
  };

  static getUpdatedCellBorderColor(data: DataType,sourceCellId: string,updatedCellData: CellDataType[][]){
    const coord = AppUtil.getParsedCellId(sourceCellId);
    const targetSourcePosition =  AppUtil.getCellPosition(sourceCellId, data);
    const height = data.initial ? data.initial.height : 0;
    const width = data.initial ? data.initial.width : 0;
  
    switch (targetSourcePosition) {
      case EPosition.TOP:
        for (let yPos = 1; yPos <= height; yPos++) {
          const xPos = coord.x;
          AppUtil.updateCellColor(
            updatedCellData,
            xPos,
            yPos,
            height,
            width
          );
        }
        break;
      case EPosition.RIGHT:
        for (let xPos = width; xPos > 0; xPos--) {
          const yPos = coord.y;
          AppUtil.updateCellColor(
            updatedCellData,
            xPos,
            yPos,
            height,
            width
          );
        }
        break;
      case EPosition.BOTTOM:
        for (let yPos = height; yPos > 0; yPos--) {
          const xPos = coord.x;
          AppUtil.updateCellColor(
            updatedCellData,
            xPos,
            yPos,
            height,
            width
          );
        }
        break;
      case EPosition.LEFT:
      default:
        for (let xPos = 0; xPos <= width; xPos++) {
          const yPos = coord.y;
          AppUtil.updateCellColor(
            updatedCellData,
            xPos,
            yPos,
            height,
            width
          );
        }
    }
  
    return updatedCellData;
  };

  static updateCellColor(updatedCellData: CellDataType[][],xPos: number,yPos: number,height: number,width: number) {
    let retVal = [];
  
    // Iterate for 4 cells to update the color according to current color
    for (let pos = 0; pos < 4; pos++) {
      let sourceColor;
  
      switch (pos) {
        case EPosition.TOP:
          sourceColor = AppUtil.getCellColorByCellCoordsAndPos(updatedCellData,xPos,yPos,pos);
          retVal.push(AppUtil.getDynamicInnerCellColor(sourceColor, yPos, height));
          break;
        case EPosition.RIGHT:
          sourceColor = AppUtil.getCellColorByCellCoordsAndPos(updatedCellData,xPos,yPos,pos);
          retVal.push(AppUtil.getDynamicInnerCellColor(sourceColor, width - xPos + 1, width));
          break;
        case EPosition.BOTTOM:
          sourceColor = AppUtil.getCellColorByCellCoordsAndPos(updatedCellData,xPos,yPos,pos);
          retVal.push(AppUtil.getDynamicInnerCellColor(sourceColor, height - yPos + 1, height));
          break;
        case EPosition.LEFT:
        default:
          sourceColor = AppUtil.getCellColorByCellCoordsAndPos(updatedCellData,xPos,yPos,pos);
          retVal.push(AppUtil.getDynamicInnerCellColor(sourceColor, xPos, width));
          break;
      }
    }
    //cell "shined" by multiple sources case as mentioned in the requirement
    let r = 0;
    let g = 0;
    let b = 0;
    /*
      r=r_1 + r_2 + r_3 + r_4
      g=g_1 + g_2 + g_3 + g_4
      b=b_1 + b_2 + b_3 + b_4
    */
    for (let i = 0; i < retVal.length; i++) {
      r += retVal[i][0];
      g += retVal[i][1];
      b += retVal[i][2];
    }
    //f=255/max(r,g,b,255)
    const f = 255 / Math.max(r, g, b, 255);
    //Result=rgb(r×f,g×f,b×f)
    const cellMixedColor = [r * f, g * f, b * f];
  
    updatedCellData[yPos][xPos] = {
      ...updatedCellData[yPos][xPos],
      color: cellMixedColor,
    };
  };
  
  static cloneCellData(cellData: CellDataType[][]){
    let newCellData: CellDataType[][] = [];
    for (let y = 0; y < cellData.length; y++) {
      newCellData[y] = [];
      for (let x = 0; x < cellData[y].length; x++) {
        newCellData[y][x] = { ...cellData[y][x] };
      }
    }
    return newCellData;
  };

  static getCellColorByCellId(cellData: CellDataType[][], cellId: string){
    const coord = AppUtil.getParsedCellId(cellId);
    return cellData[coord.y][coord.x].color;
  };

  static getCellColorByCellCoordsAndPos(updatedCellData: CellDataType[][],xPos: number,yPos: number,position: number){
    let color: number[] = [];
    switch (position) {
      case EPosition.TOP:
        color = updatedCellData[0][xPos].color;
        break;
      case EPosition.BOTTOM:
        color = updatedCellData[updatedCellData.length - 1][xPos].color;
        break;
      case EPosition.RIGHT:
        color = updatedCellData[yPos][updatedCellData[yPos].length - 1].color;
        break;
      case EPosition.LEFT:
      default:
        color = updatedCellData[yPos][0].color;
    }
    return color;
  };
    
}