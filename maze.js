Maze.FILLED = "#000000";
Maze.OPEN = "#ffffff";
Maze.VERTICAL = 0;
Maze.HORIZONTAL = 1;
Maze.TOPOLOGY_RECTANGLE = "rectangle";
Maze.TOPOLOGY_OUTDOOR   = "outdoor";
Maze.TOPOLOGY_CYLINDER  = "cylinder";
Maze.TOPOLOGY_TORUS     = "torus";
Maze.TOPOLOGY_MOBIUS    = "mobius";

Maze.TOPOLOGY_WALL  = 0;
Maze.TOPOLOGY_OPEN  = 1;
Maze.TOPOLOGY_LOOP  = 2;
Maze.TOPOLOGY_TWIST = 3;

function Maze(topology, sizeX, sizeY, options) {
  if (options == null) options = {};
  this.topology = topology;
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
      this.topologyX = Maze.TOPOLOGY_WALL;
      this.topologyY = Maze.TOPOLOGY_WALL;
      break;
    case Maze.TOPOLOGY_OUTDOOR:
      this.topologyX = Maze.TOPOLOGY_OPEN;
      this.topologyY = Maze.TOPOLOGY_OPEN;
      break;
    case Maze.TOPOLOGY_CYLINDER:
      this.topologyX = Maze.TOPOLOGY_LOOP;
      this.topologyY = Maze.TOPOLOGY_WALL;
      break;
    case Maze.TOPOLOGY_TORUS:
      this.topologyX = Maze.TOPOLOGY_LOOP;
      this.topologyY = Maze.TOPOLOGY_LOOP;
      break;
    case Maze.TOPOLOGY_MOBIUS:
      this.topologyX = Maze.TOPOLOGY_TWIST;
      this.topologyY = Maze.TOPOLOGY_WALL;
      break;
    default: throw Error();
  }
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  if (this.topologyX === Maze.TOPOLOGY_OPEN || this.topologyY === Maze.TOPOLOGY_OPEN) {
    if (this.topologyX === Maze.TOPOLOGY_OPEN && this.topologyY === Maze.TOPOLOGY_OPEN) {
      this.outdoorRoom = sizeX * sizeY;
    } else {
      throw Error("TODO: support partial outdoors");
    }
  }
  var initialEdgeColor = options.initialEdgeColor || Maze.OPEN;
  var initialRoomColor = options.initialRoomColor || Maze.OPEN;
  var initialVertexColor = options.initialVertexColor || Maze.OPEN;

  this.edgeColors = [];
  var edgeCount = this.getEdgeCount();
  for (var i = 0; i < edgeCount; i++) {
    this.edgeColors.push(initialEdgeColor);
  }

  this.roomColors = [];
  var roomCount = this.getRoomCount()
  for (var i = 0; i < roomCount; i++) {
    this.roomColors.push(initialRoomColor);
  }

  this.vertexColors = [];
  var vertexCount = this.getVertexCount();
  for (var i = 0; i < vertexCount; i++) {
    this.vertexColors.push(initialVertexColor);
  }
};

Maze.prototype.getEdgeCount = function() {
  return (
    this.sizeX * (this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY)) +
    this.sizeY * (this.sizeX + Maze.getEdgeCountAdjustment(this.topologyX))
  );
};
Maze.prototype.getEdgeFromLocation = function(orientation, x, y) {
  x = Maze.modForTopology(x, this.sizeX, this.topologyX);
  y = Maze.modForTopology(y, this.sizeY, this.topologyY);
  if (orientation === Maze.HORIZONTAL) {
    var horizontalEdgeMajorSize = this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY);
    if (this.topologyY === Maze.TOPOLOGY_OPEN) {
      y += 1;
    }
    if (this.topologyX === Maze.TOPOLOGY_TWIST) {
      if (x >= this.sizeX) {
        x -= this.sizeX;
        y = horizontalEdgeMajorSize - 1 - y;
      }
    }
    return x * horizontalEdgeMajorSize + y;
  } else {
    if (this.topologyX === Maze.TOPOLOGY_OPEN) {
      x += 1;
    }
    if (this.topologyX === Maze.TOPOLOGY_TWIST) {
      if (x >= this.sizeX) {
        x -= this.sizeX;
        y = this.sizeY - 1 - y;
      }
    }
    return this.getHorizontalEdgeCount() + x * this.sizeY + y;
  }
};
Maze.prototype.getHorizontalEdgeCount = function() {
  return this.sizeX * (this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY));
};
Maze.prototype.getEdgeLocation = function(edge) {
  var orientation;
  var x;
  var y;
  var horizontalEdgeCount = this.getHorizontalEdgeCount();
  var horizontalEdgeMajorSize = this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY);
  if (edge < horizontalEdgeCount) {
    orientation = Maze.HORIZONTAL;
    x = Math.floor(edge / horizontalEdgeMajorSize);
    y = edge % horizontalEdgeMajorSize;
    if (this.topologyY === Maze.TOPOLOGY_OPEN) {
      y -= 1;
    }
  } else {
    edge -= horizontalEdgeCount;
    orientation = Maze.VERTICAL;
    x = Math.floor(edge / this.sizeY);
    y = edge % this.sizeY;
    if (this.topologyX === Maze.TOPOLOGY_OPEN) {
      x -= 1;
    }
  }
  return {orientation:orientation, x:x, y:y};
};

Maze.prototype.getRoomCount = function() {
  if (this.topologyX === Maze.TOPOLOGY_OPEN || this.topologyY === Maze.TOPOLOGY_OPEN) {
    if (this.topologyX === Maze.TOPOLOGY_OPEN && this.topologyY === Maze.TOPOLOGY_OPEN) {
      return this.sizeX * this.sizeY + 1;
    } else {
      throw Error("TODO: support partial outdoors");
    }
  }
  return this.sizeX * this.sizeY;
};
Maze.prototype.getRoomFromLocation = function(x, y) {
  x = Maze.modForTopology(x, this.sizeX, this.topologyX);
  y = Maze.modForTopology(y, this.sizeY, this.topologyY);
  if (this.topologyX === Maze.TOPOLOGY_OPEN || this.topologyY === Maze.TOPOLOGY_OPEN) {
    if (this.topologyX === Maze.TOPOLOGY_OPEN && this.topologyY === Maze.TOPOLOGY_OPEN) {
      if (x < 0 || x >= this.sizeX ||
          y < 0 || y >= this.sizeY) {
        return this.outdoorRoom;
      }
    } else {
      throw Error("TODO: support partial outdoors");
    }
  }
  if (this.topologyX === Maze.TOPOLOGY_TWIST) {
    if (x >= this.sizeX) {
      x -= this.sizeX;
      y = this.sizeY - 1 - y;
    }
  }
  return this.sizeY * x + y;
};
Maze.prototype.getRoomLocation = function(room) {
  if (this.topologyX === Maze.TOPOLOGY_OPEN || this.topologyY === Maze.TOPOLOGY_OPEN) {
    if (this.topologyX === Maze.TOPOLOGY_OPEN && this.topologyY === Maze.TOPOLOGY_OPEN) {
      if (room === this.outdoorRoom) return {x:-1, y:-1};
    } else {
      throw Error("TODO: support partial outdoors");
    }
  }
  var x = Math.floor(room / this.sizeY);
  var y = room % this.sizeY;
  return {x:x, y:y};
};

Maze.prototype.roomToVectors = function(room) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE: break;
    case Maze.TOPOLOGY_OUTDOOR:
      if (room === this.outdoorRoom) {
        var result = [];
        for (var x = 0; x < this.sizeX; x++) {
          result.push({
            edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, -1),
            room:this.getRoomFromLocation(x, 0),
          });
          result.push({
            edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, this.sizeY - 1),
            room:this.getRoomFromLocation(x, this.sizeY - 1),
          });
        }
        for (var y = 0; y < this.sizeY; y++) {
          result.push({
            edge:this.getEdgeFromLocation(Maze.VERTICAL, -1, y),
            room:this.getRoomFromLocation(0, y),
          });
          result.push({
            edge:this.getEdgeFromLocation(Maze.VERTICAL, this.sizeX - 1, y),
            room:this.getRoomFromLocation(this.sizeX - 1, y),
          });
        }
        return result;
      }
      break;
    case Maze.TOPOLOGY_CYLINDER:  break;
    case Maze.TOPOLOGY_TORUS:     break;
    case Maze.TOPOLOGY_MOBIUS:    break;
    default: throw Error();
  }
  var roomLocation = this.getRoomLocation(room);
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
      var vectors = [];
      var edges = [
        this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y    ),
        this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y    ),
        this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y + 0),
        this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y - 1),
      ];
      var neighborLocations = [
        {x:roomLocation.x + 1, y:roomLocation.y    },
        {x:roomLocation.x - 1, y:roomLocation.y    },
        {x:roomLocation.x    , y:roomLocation.y + 1},
        {x:roomLocation.x    , y:roomLocation.y - 1},
      ];
      for (var i = 0; i < neighborLocations.length; i++) {
        var neighborLocation = neighborLocations[i];
        if (neighborLocation.x < 0 || neighborLocation.x >= this.sizeX) continue;
        if (neighborLocation.y < 0 || neighborLocation.y >= this.sizeY) continue;
        var neighbor = this.getRoomFromLocation(neighborLocation.x, neighborLocation.y);
        vectors.push({edge:edges[i], room:neighbor});
      }
      return vectors;
    case Maze.TOPOLOGY_OUTDOOR:
    case Maze.TOPOLOGY_TORUS:
      return [
        { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y    ),
          room:this.getRoomFromLocation(                 roomLocation.x + 1, roomLocation.y    ) },
        { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y    ),
          room:this.getRoomFromLocation(                 roomLocation.x - 1, roomLocation.y    ) },
        { edge:this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y + 0),
          room:this.getRoomFromLocation(                 roomLocation.x    , roomLocation.y + 1) },
        { edge:this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x    , roomLocation.y - 1),
          room:this.getRoomFromLocation(                 roomLocation.x    , roomLocation.y - 1) },
      ];
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_MOBIUS:
      var vectors = [
        { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x + 0, roomLocation.y),
          room:this.getRoomFromLocation(                 roomLocation.x + 1, roomLocation.y) },
        { edge:this.getEdgeFromLocation(Maze.VERTICAL,   roomLocation.x - 1, roomLocation.y),
          room:this.getRoomFromLocation(                 roomLocation.x - 1, roomLocation.y) },
      ];
      var edges = [
        this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x, roomLocation.y + 0),
        this.getEdgeFromLocation(Maze.HORIZONTAL, roomLocation.x, roomLocation.y - 1),
      ];
      var neighborLocations = [
        {x:roomLocation.x, y:roomLocation.y + 1},
        {x:roomLocation.x, y:roomLocation.y - 1},
      ];
      for (var i = 0; i < neighborLocations.length; i++) {
        var neighborLocation = neighborLocations[i];
        if (neighborLocation.y < 0 || neighborLocation.y >= this.sizeY) continue;
        var neighbor = this.getRoomFromLocation(neighborLocation.x, neighborLocation.y);
        vectors.push({edge:edges[i], room:neighbor});
      }
      return vectors;
    default: throw Error();
  }
};

Maze.prototype.edgeToRoomPair = function(edge) {
  var edgeLocation = this.getEdgeLocation(edge);
  var result = [];
  var x = edgeLocation.x;
  var y = edgeLocation.y;
  result.push(this.getRoomFromLocation(x, y));
  if (edgeLocation.orientation === Maze.HORIZONTAL) {
    y += 1;
  } else {
    x += 1;
  }
  result.push(this.getRoomFromLocation(x, y));
  return result;
};

Maze.prototype.getVertexCount = function() {
  return (
    (this.sizeX + Maze.getEdgeCountAdjustment(this.topologyX)) *
    (this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY))
  );
};
Maze.prototype.getVertexLocation = function(vertex) {
  var majorSize = this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY);
  var x = Math.floor(vertex / majorSize);
  var y = vertex % majorSize;
  if (this.topologyX === Maze.TOPOLOGY_OPEN) {
    x -= 1;
  }
  if (this.topologyY === Maze.TOPOLOGY_OPEN) {
    y -= 1;
  }
  return {x:x, y:y};
};
Maze.prototype.getVertexFromLocation = function(x, y) {
  var majorSize = this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY);
  x = Maze.modForTopology(x, this.sizeX, this.topologyX);
  y = Maze.modForTopology(y, this.sizeY, this.topologyY);
  if (this.topologyX === Maze.TOPOLOGY_OPEN) {
    x += 1;
  }
  if (this.topologyY === Maze.TOPOLOGY_OPEN) {
    y += 1;
  }
  if (this.topologyX === Maze.TOPOLOGY_TWIST) {
    if (x >= this.sizeX) {
      x -= this.sizeX;
      y = this.sizeY + Maze.getEdgeCountAdjustment(this.topologyY) - 1 - y;
    }
  }
  return majorSize * x + y;
};
Maze.prototype.vertexToEdges = function(vertex) {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_TORUS:
    case Maze.TOPOLOGY_MOBIUS:
      var vertexLocation = this.getVertexLocation(vertex);
      var x = vertexLocation.x;
      var y = vertexLocation.y;
      return [
        this.getEdgeFromLocation(Maze.VERTICAL, x, y),
        this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
        this.getEdgeFromLocation(Maze.HORIZONTAL, x, y),
        this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y),
      ];
    case Maze.TOPOLOGY_OUTDOOR:
      return this.vertexToBranches(vertex).map(function(branch) { return branch.edge; });
    default: throw Error();
  }
};
Maze.prototype.vertexToBranches = function(vertex) {
  var vertexLocation = this.getVertexLocation(vertex);
  var x = vertexLocation.x;
  var y = vertexLocation.y;
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
      var branches = [];
      if (x < this.sizeX - 2) {
        branches.push({
          vertex:this.getVertexFromLocation(x + 1, y),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y),
        });
      }
      if (x > 0) {
        branches.push({
          vertex:this.getVertexFromLocation(x - 1, y),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, y),
        });
      }
      if (y < this.sizeY - 2) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y + 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
        });
      }
      if (y > 0) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y - 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y),
        });
      }
      return branches;
    case Maze.TOPOLOGY_OUTDOOR:
      var branches = [];
      if (x < this.sizeX - 1) {
        branches.push({
          vertex:this.getVertexFromLocation(x + 1, y),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y),
        });
      }
      if (x > -1) {
        branches.push({
          vertex:this.getVertexFromLocation(x - 1, y),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x, y),
        });
      }
      if (y < this.sizeY - 1) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y + 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
        });
      }
      if (y > -1) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y - 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y),
        });
      }
      return branches;
    case Maze.TOPOLOGY_CYLINDER:
      var branches = [
        { vertex:this.getVertexFromLocation(             x + 1, y    ),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y    ) },
        { vertex:this.getVertexFromLocation(             x - 1, y    ),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x - 0, y    ) },
      ];
      if (y < this.sizeY - 2) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y + 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
        });
      }
      if (y > 0) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y - 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y),
        });
      }
      return branches;
    case Maze.TOPOLOGY_TORUS:
      var branches = [
        { vertex:this.getVertexFromLocation(             x + 1, y    ),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y    ) },
        { vertex:this.getVertexFromLocation(             x - 1, y    ),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x - 0, y    ) },
        { vertex:this.getVertexFromLocation(             x    , y + 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL,   x    , y + 1) },
        { vertex:this.getVertexFromLocation(             x    , y - 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL,   x    , y - 0) },
      ];
      return branches;
    case Maze.TOPOLOGY_MOBIUS:
      var branches = [
        { vertex:this.getVertexFromLocation(             x + 1, y    ),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x + 1, y    ) },
        { vertex:this.getVertexFromLocation(             x - 1, y    ),
          edge:this.getEdgeFromLocation(Maze.HORIZONTAL, x - 0, y    ) },
      ];
      if (y < this.sizeY - 2) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y + 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y + 1),
        });
      }
      if (y > 0) {
        branches.push({
          vertex:this.getVertexFromLocation(x, y - 1),
          edge:this.getEdgeFromLocation(Maze.VERTICAL, x, y),
        });
      }
      return branches;
    default: throw Error();
  }
};
Maze.prototype.getBorderBranches = function() {
  switch (this.topology) {
    case Maze.TOPOLOGY_RECTANGLE:
      var branches = [];
      if (this.sizeY > 1) {
        for (var x = 0; x < this.sizeX - 1; x++) {
          branches.push({
            vertex:this.getVertexFromLocation(x, 0),
            edge:this.getEdgeFromLocation(Maze.VERTICAL, x, 0),
          });
          branches.push({
            vertex:this.getVertexFromLocation(x, this.sizeY - 2),
            edge:this.getEdgeFromLocation(Maze.VERTICAL, x, this.sizeY - 1),
          });
        }
      }
      if (this.sizeX > 1) {
        for (var y = 0; y < this.sizeY - 1; y++) {
          branches.push({
            vertex:this.getVertexFromLocation(0, y),
            edge:this.getEdgeFromLocation(Maze.HORIZONTAL, 0, y),
          });
          branches.push({
            vertex:this.getVertexFromLocation(this.sizeX - 2, y),
            edge:this.getEdgeFromLocation(Maze.HORIZONTAL, this.sizeX - 1, y),
          });
        }
      }
      return branches;
    case Maze.TOPOLOGY_OUTDOOR:
    case Maze.TOPOLOGY_TORUS:
      return [];
    case Maze.TOPOLOGY_CYLINDER:
    case Maze.TOPOLOGY_MOBIUS:
      var branches = [];
      if (this.sizeY > 1) {
        for (var x = 0; x < this.sizeX; x++) {
          branches.push({
            vertex:this.getVertexFromLocation(x, 0),
            edge:this.getEdgeFromLocation(Maze.VERTICAL, x, 0),
          });
          branches.push({
            vertex:this.getVertexFromLocation(x, this.sizeY - 2),
            edge:this.getEdgeFromLocation(Maze.VERTICAL, x, this.sizeY - 1),
          });
        }
      }
      return branches;
    default: throw Error();
  }
};

Maze.prototype.shave = function() {
  var self = this;
  var edgesToOpen = [];
  var vertexCount = this.getVertexCount();
  for (var i = 0; i < vertexCount; i++) {
    var edges = self.vertexToEdges(i).filter(function(edge) {
      return self.edgeColors[edge] === Maze.FILLED;
    });
    if (edges.length === 1) {
      this.vertexColors[i] = Maze.OPEN;
      edgesToOpen.push(edges[0]);
    }
  }
  for (var i = 0; i < edgesToOpen.length; i++) {
    self.edgeColors[edgesToOpen[i]] = Maze.OPEN;
  }
};
Maze.prototype.caveIn = function() {
  var self = this;
  var roomsToFill = [];
  var edgesToFill = [];
  var roomCount = this.getRoomCount();
  for (var i = 0; i < roomCount; i++) {
    var openVectors = self.roomToVectors(i).filter(function(vector) {
      return self.edgeColors[vector.edge] === Maze.OPEN;
    });
    if (openVectors.length === 1) {
      roomsToFill.push(i);
      edgesToFill.push(openVectors[0].edge);
    } else if (openVectors.length === 0 && self.roomColors[i] === Maze.OPEN) {
      roomsToFill.push(i);
    }
  }
  for (var i = 0; i < roomsToFill.length; i++) {
    self.roomColors[roomsToFill[i]] = Maze.FILLED;
  }
  for (var i = 0; i < edgesToFill.length; i++) {
    self.edgeColors[edgesToFill[i]] = Maze.FILLED;
  }
};

Maze.hexEncoding = "abcdefghijklmnop";
Maze.prototype.getSerialization = function() {
  var bitArray = this.edgeColors.map(function(edge) { return edge === Maze.FILLED ? 1 : 0; });
  var nibbleAlignment = (bitArray.length + 3) & ~3;
  for (var i = bitArray.length; i < nibbleAlignment; i++) {
    bitArray.push(0);
  }
  var serialization = this.topology + "," + this.sizeX + "," + this.sizeY + ",";
  for (var i = 0; i < bitArray.length; i += 4) {
    var nibble = (bitArray[i+0] << 3) |
                 (bitArray[i+1] << 2) |
                 (bitArray[i+2] << 1) |
                 (bitArray[i+3] << 0) ;
    serialization += Maze.hexEncoding[nibble];
  }
  return serialization;
};
Maze.decodeRegex = new RegExp("^(rectangle|outdoor|cylinder|torus|mobius),(\\d+),(\\d+),([" + Maze.hexEncoding + "]*)$");
Maze.fromSerialization = function(string) {
  var match = Maze.decodeRegex.exec(string);
  if (match == null) return null;
  var topology = match[1];
  var sizeX = parseInt(match[2]);
  var sizeY = parseInt(match[3]);
  var edgeData = match[4];
  var maze = new Maze(topology, sizeX, sizeY, {initialVertexColor: Maze.FILLED});

  var zero = Maze.hexEncoding.charCodeAt(0);
  var bitArray = [];
  for (var i = 0; i < edgeData.length; i++) {
    var nibble = edgeData.charCodeAt(i) - zero;
    bitArray.push((nibble & 0x8) >> 3);
    bitArray.push((nibble & 0x4) >> 2);
    bitArray.push((nibble & 0x2) >> 1);
    bitArray.push((nibble & 0x1) >> 0);
  }

  var edgeCount = maze.getEdgeCount();
  var extraBitCount = bitArray.length - edgeCount;
  if (!(0 <= extraBitCount && extraBitCount < 4)) return null;
  for (var i = 0; i < extraBitCount; i++) {
    bitArray.pop();
  }

  for (var i = 0; i < edgeCount; i++) {
    if (bitArray[i] !== 0) maze.edgeColors[i] = Maze.FILLED;
  }
  return maze;
};

Maze.getEdgeCountAdjustment = function(topology) {
  switch (topology) {
    case Maze.TOPOLOGY_WALL:  return -1;
    case Maze.TOPOLOGY_OPEN:  return  1;
    case Maze.TOPOLOGY_LOOP:  return  0;
    case Maze.TOPOLOGY_TWIST: return  0;
    default: throw Error();
  }
};
Maze.modForTopology = function(x, sizeX, topologyX) {
  switch (topologyX) {
    case Maze.TOPOLOGY_WALL:  return x;
    case Maze.TOPOLOGY_OPEN:  return x;
    case Maze.TOPOLOGY_LOOP:  return util.euclideanMod(x, sizeX);
    case Maze.TOPOLOGY_TWIST: return util.euclideanMod(x, sizeX * 2);
    default: throw Error();
  }
};
