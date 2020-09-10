var app = angular.module('diagUiDemoApp', ['treeGrid']);

var rawData = [
  {
    "path": "/daemons/wb-mqtt-serial/status",
    "status": "ok",
    "message": "daemon is working (pid 3458)",
    "timestamp": 1599723978,
  },
  {
    "path": "/daemons/wb-rules/status",
    "status": "ok",
    "message": "daemon is working (pid 3571)",
    "timestamp": 1599723978,
  },
  {
    "path": "/wb-mqtt-serial/bus1/device1/rate",
    "status": "ok",
    "message": "actual 38 Hz, required 40 Hz",
    "timestamp": 1599723978,
  },
  {
    "path": "/wb-mqtt-serial/bus1/device1/status",
    "status": "ok",
    "message": "device is online",
    "timestamp": 1599723978,
  },
  {
    "path": "/wb-mqtt-serial/bus1/device2/rate",
    "status": "warn",
    "message": "actual 32 Hz, required 40 Hz",
    "timestamp": 1599723978,
  },
  {
    "path": "/wb-mqtt-serial/bus1/device2/status",
    "status": "ok",
    "message": "device is online",
    "timestamp": 1599723978,
  },
  {
    "path": "/wb-mqtt-serial/bus1/device3/status",
    "status": "error",
    "message": "device is offline",
    "timestamp": 1599723978,
  },
  {
    "path": "/wb-mqtt-serial/bus2/device1/rate",
    "status": "ok",
    "message": "actual 40 Hz, required 40 Hz",
    "timestamp": 1599723978,
  },
  {
    "path": "/wb-mqtt-serial/bus2/device1/status",
    "status": "ok",
    "message": "device is online",
    "timestamp": 1599723978,
  },
  {
    "path": "/rules/heater/status",
    "status": "ok",
    "message": "heater health is OK",
    "timestamp": 1599723978,
  }
];

app.controller('diagUiController', function($scope, $timeout) {
  var tree;

  function makeTree(log) {
    function makeEntry(level) {
      return {
        "props": {
          "children": [],
          "level": level,
          "selected": false,
          "expanded": false
        }
      };
    }

    function getCategory_r(path, level, subtree) {
      var cur_entry = path[0];

      if (path.length == 1) {
        if (!(cur_entry in subtree)) {
          subtree[cur_entry] = makeEntry(level);
        }
        
        return subtree[cur_entry];
      } else {
        if (!(cur_entry in subtree)) {
          subtree[cur_entry] = makeEntry(level);
        }
        
        return getCategory_r(path.slice(1), level + 1, subtree[cur_entry]);
      }
    }

    function getOrCreateCategory(path, subtree) {
      var spl = path.split("/").slice(1);
      
      return getCategory_r(spl, 1, subtree);
    }

    // form a tree
    var tree = {};

    log.forEach(function(entry) {
      var cat = getOrCreateCategory(entry.path, tree);
      console.log("cat for", entry.path, cat);

      for (key in entry) {
        cat.props[key] = entry[key];
      }
    });

    // format tree for view
    function fmtTree_r(tree) {
      var subtree = [];

      for (key in tree) {
        if (key !== "props") {
          var obj = tree[key].props;
          obj.subsystem = key;
          obj.children = fmtTree_r(tree[key]);

          subtree.push(obj);
        }
      }

      return subtree;
    }

    var fmt_tree = fmtTree_r(tree);

    function fillClasses(st) {
      if (st === "ok") {
        return "btn-success";
      } else if (st === "warn" || st === "mixed") {
        return "btn-warning";
      } else if (st === "error") {
        return "btn-danger";
      } else {
        return "btn-default";
      }
    }

    function setStatus(old_st, new_st) {
      if (new_st === "error") {
        if (old_st === "error" || old_st === "unknown") {
          return "error";
        } else {
          return "mixed";
        }
      } else if (new_st === "warn") {
        if (old_st === "warn" || old_st === "unknown") {
          return "warn";
        } else {
          return "mixed";
        }
      } else if (new_st === "ok") {
        if (old_st === "ok" || old_st === "unknown") {
          return "ok";
        } else {
          return "mixed";
        }
      } else if (old_st === "mixed" || new_st == "mixed") {
        return "mixed";
      } else {
        return "unknown";
      }
    }
    
    // fill status messages for categories
    function fillStatus_r(fmt_tree) {
      var cum_status = "unknown";

      fmt_tree.forEach(function(entry) {
        if (!("status" in entry)) {
          entry["status"] = fillStatus_r(entry.children);
        }

        entry["classes"] = fillClasses(entry["status"]);
        cum_status = setStatus(cum_status, entry["status"]);
      });

      return cum_status;
    }

    fillStatus_r(fmt_tree);

    return fmt_tree;
  }

  var logTreeData = makeTree(rawData);

  $scope.my_tree = tree = {};

  $scope.tree_data = logTreeData;

  $scope.expanding_property = {
    field: "subsystem",
    displayName: "Subsystem",
    filterable: true,
    sortable: false,
  };

  $scope.col_defs = [
    {
      field: "status",
      displayName: "Status",
      sortable: true,
      sortingType: "string",
      cellTemplate: "<button class='btn btn-xs {{row.branch.classes}}'>{{row.branch[col.field]}}</button>"
    }
  ];

  $scope.tableLog = rawData;
});
