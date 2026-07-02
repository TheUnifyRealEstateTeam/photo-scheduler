exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { agentEmail, address, city, zip, startTime, endTime, package: pkg, sqft, notes } = body;

    const FUB_API_KEY = "fka_0RfdT60J6JhAvBBW39HWNLdDFRsPKNenLm";
    const auth = Buffer.from(FUB_API_KEY + ":").toString("base64");

    // First find the person in FUB by email
    let personId = null;
    if (agentEmail) {
      const personRes = await fetch(`https://api.followupboss.com/v1/people?email=${encodeURIComponent(agentEmail)}`, {
        headers: {
          "Authorization": "Basic " + auth,
          "Content-Type": "application/json"
        }
      });
      const personData = await personRes.json();
      if (personData.people && personData.people.length > 0) {
        personId = personData.people[0].id;
      }
    }

    // Create the appointment
    const appointment = {
      title: `📸 Listing Photos — ${address}, ${city} ${zip}`,
      startTime: startTime,
      endTime: endTime,
      description: `Package: ${pkg}\nSqft: ${sqft}\n${notes || ""}`,
      type: "Appointment"
    };

    if (personId) appointment.personId = personId;

    const apptRes = await fetch("https://api.followupboss.com/v1/appointments", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + auth,
        "Content-Type": "application/json",
        "X-System": "UnifyPhotoScheduler",
        "X-System-Key": "unify_photo_scheduler_2026"
      },
      body: JSON.stringify(appointment)
    });

    const apptData = await apptRes.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, appointment: apptData })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: e.message })
    };
  }
};
