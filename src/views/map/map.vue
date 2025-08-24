<template>
    <div class="map-page-container">
      <!-- 地图容器 -->
      <div id="baidu-map-container" v-loading="mapLoading" element-loading-text="正在定位并加载地图..."></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { ElMessage } from 'element-plus';
  
  const mapLoading = ref(true);
  let map = null; // 用于存放地图实例
  
  onMounted(() => {
    // 确保 BMapGL 对象已由外部脚本加载
    if (typeof BMapGL === 'undefined') {
      ElMessage.error("百度地图脚本加载失败，请检查网络和API密钥。");
      mapLoading.value = false;
      return;
    }
    initializeMap();
  });
  
  onUnmounted(() => {
    // 组件销毁时清理地图实例
    map = null;
  });
  
  const initializeMap = () => {
    // 1. 创建地图实例
    map = new BMapGL.Map('baidu-map-container');
    // 设置默认中心点（上海）和缩放级别
    const defaultCenter = new BMapGL.Point(121.4737, 31.2304);
    map.centerAndZoom(defaultCenter, 15);
    // 启用滚轮缩放
    map.enableScrollWheelZoom(true);
  
    // 2. 添加地图控件
    map.addControl(new BMapGL.ScaleControl());
    map.addControl(new BMapGL.ZoomControl());
  
    // 3. 获取用户当前位置
    const geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition(function(result) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        const userPoint = result.point;
        map.centerAndZoom(userPoint, 15); // 将地图中心移动到用户位置
        const userMarker = new BMapGL.Marker(userPoint);
        map.addOverlay(userMarker);
        userMarker.setLabel(new BMapGL.Label('You are here', {
            position: userPoint,
            offset: new BMapGL.Size(20, -10)
        }));
        ElMessage.success("成功定位到您的位置！");
        
        // 4. 定位成功后，添加自定义搜索控件
        addCustomSearchControl(userPoint);
  
      } else {
        ElMessage.error("定位失败，将使用默认位置。请检查浏览器定位权限。");
        // 定位失败时，仍然添加控件，但使用默认中心点
        addCustomSearchControl(defaultCenter);
      }
      mapLoading.value = false;
    });
  };
  
  // 5. 创建并添加自定义搜索控件
  const addCustomSearchControl = (centerPoint) => {
    // 定义一个自定义控件类
    function SearchControl() {
      this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
      this.defaultOffset = new BMapGL.Size(20, 20);
    }
    // 继承 BMapGL.Control
    SearchControl.prototype = new BMapGL.Control();
    // 实现 initialize 方法
    SearchControl.prototype.initialize = function(map) {
      const container = document.createElement('div');
      container.style.backgroundColor = 'white';
      container.style.padding = '10px';
      container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      container.style.borderRadius = '5px';
  
      const hospitalButton = document.createElement('button');
      hospitalButton.textContent = 'Find Hospitals';
      hospitalButton.style.marginRight = '10px';
      hospitalButton.onclick = () => searchNearby('医院', centerPoint);
  
      const pharmacyButton = document.createElement('button');
      pharmacyButton.textContent = 'Find Pharmacies';
      pharmacyButton.onclick = () => searchNearby('药店', centerPoint);
  
      // Element Plus 样式模拟
      [hospitalButton, pharmacyButton].forEach(btn => {
          btn.style.border = '1px solid #dcdfe6';
          btn.style.padding = '8px 15px';
          btn.style.borderRadius = '4px';
          btn.style.cursor = 'pointer';
          btn.style.backgroundColor = '#409eff';
          btn.style.color = 'white';
      });
  
      container.appendChild(hospitalButton);
      container.appendChild(pharmacyButton);
      map.getContainer().appendChild(container);
      return container;
    };
    // 创建控件实例并添加到地图
    const mySearchControl = new SearchControl();
    map.addControl(mySearchControl);
  };
  
  // 6. 执行周边搜索
  const searchNearby = (keyword, centerPoint) => {
      map.clearOverlays(); // 清除之前的搜索结果
      const userMarker = new BMapGL.Marker(centerPoint); // 重新添加用户位置标记
      map.addOverlay(userMarker);
      userMarker.setLabel(new BMapGL.Label('You are here', {
          position: centerPoint,
          offset: new BMapGL.Size(20, -10)
      }));
  
      const localSearch = new BMapGL.LocalSearch(map, {
          renderOptions: { map: map, autoViewport: true }
      });
      localSearch.searchNearby(keyword, centerPoint, 10000); // 搜索半径10公里
  };
  
  </script>
  
  <style scoped>
  .map-page-container, #baidu-map-container {
    width: 100%;
    height: 85vh; /* 使地图容器占满可用垂直空间 */
  }
  </style>