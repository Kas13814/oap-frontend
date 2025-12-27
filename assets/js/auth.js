(function () {
  const publicPages = [
    "/Login.html",
    "/joining.html"
  ];

  const currentPath = window.location.pathname;

  if (!publicPages.includes(currentPath)) {
    if (sessionStorage.getItem("auth") !== "true") {
      window.location.href = "/Login.html";
    }
  }
})();
