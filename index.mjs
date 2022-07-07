import fetch from "node-fetch";

const ledgerName = "test/test";

function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

async function run() {
  //create a ledger
  const newLedgerResults = await fetch("http://localhost:8090/fdb/new-ledger", {
    method: "POST",
    body: JSON.stringify({ "ledger/id": ledgerName }),
  });

  await delay(1000);

  //add schema
  const schema = [
    {
      _id: "_collection",
      name: "test",
    },
    {
      _id: "_predicate",
      name: "test/description",
      type: "string",
    },
    {
      _id: "_predicate",
      name: "test/count",
      type: "int",
    },
    {
      _id: "_predicate",
      name: "test/user",
      type: "ref",
      multi: false,
      restrictCollection: "_user",
    },
  ];

  const addSchemaResults = await fetch(
    `http://localhost:8090/fdb/${ledgerName}/transact`,
    {
      method: "POST",
      body: JSON.stringify(schema),
    }
  );
  await delay(1000);

  //add data
  const data = [
    {
      _id: "_user$jake",
      username: "jake",
    },
    {
      _id: "test$first",
      "test/description": "first test",
      "test/count": 0,
      "test/user": "_user$jake",
    },
    {
      _id: "test$second",
      "test/description": "second test",
      "test/count": 1,
    },
    {
      _id: "test$third",
      "test/description": "third test",
      "test/count": 2,
    },
  ];

  const transactResults = await fetch(
    `http://localhost:8090/fdb/${ledgerName}/transact`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  await delay(1000);

  //query data
  const query = {
    where: [
      ["?t", "test/description", "?description"],
      ["?t", "test/count", "?count"],
      ["?t", "test/user", "?username"],
    ],
    select: { "?t": ["description", "count", "user"] },
    vars: {
      "?username": ["_user/username", "jake"],
    },
  };
  const results = await fetch(`http://localhost:8090/fdb/${ledgerName}/query`, {
    method: "POST",
    body: JSON.stringify(query),
  });

  console.log("status: ", results.status);

  const resultsData = await results.json();
  console.log(resultsData);

  if (resultsData.length > 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run();
