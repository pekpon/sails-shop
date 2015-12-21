 <% 
 var code = "Code: " + error.httpStatusCode; 
 var description = JSON.stringify(error, null, 2);
 %>

    <div class="container">
      <h1>Error</h1>
      <h2>(<%=code%>)</h2>
      <pre>
        <p><%=description%></p>
      </pre>
      <a href="/cart/checkout" class="btn btn-primary">Back</a>
    </div>
