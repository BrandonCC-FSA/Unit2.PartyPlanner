const appDiv = document.querySelector(`#app`);

const state = {
  partiesList: [],
  selectedParty: null,
  error: null,
  guests: [],
  rsvps: [],
};

const fetchParties = async () => {
  try {
    const res = await fetch(
      `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2505-ftb-et-web-ft/events`
    );
    const json = await res.json();
    state.partiesList = json.data ?? [];
    state.selectedParty = null;
    state.error = null;
    render();
  } catch {
    state.error = `Failed to fetch parties.`;
    render();
  }
};

const fetchGuestsAndRsvps = async () => {
  try {
    const [guestsRes, rsvpsRes] = await Promise.all([
      fetch(
        `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2505-ftb-et-web-ft/guests`
      ),
      fetch(
        `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2505-ftb-et-web-ft/rsvps`
      ),
    ]);
    state.guests = (await guestsRes.json()).data ?? [];
    state.rsvps = (await rsvpsRes.json()).data ?? [];
  } catch {
    state.error = `Failed to fetch guests or RSVPs.`;
  }
};

const fetchPartyById = async (id) => {
  try {
    const res = await fetch(
      `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2505-ftb-et-web-ft/events/${id}`
    );
    state.selectedParty = (await res.json()).data ?? null;
    state.error = null;
    await fetchGuestsAndRsvps();
    render();
  } catch {
    state.error = `Failed to fetch party details.`;
    render();
  }
};

const getPartyGuests = (partyId) => {
  const guestIds = state.rsvps
    .filter((r) => r.eventId === partyId)
    .map((r) => r.guestId);
  return state.guests.filter((g) => guestIds.includes(g.id));
};

const PartyList = (parties) => {
  const nav = document.createElement(`nav`);
  if (!parties.length) {
    nav.textContent = `No parties found.`;
    return nav;
  }
  const ul = document.createElement(`ul`);
  parties.forEach(({ id, name }) => {
    const li = document.createElement(`li`);
    li.textContent = name;
    li.style.cursor = `pointer`;
    if (state.selectedParty?.id === id) {
      li.classList.add("selected");
    }
    li.onclick = () => fetchPartyById(id);
    ul.appendChild(li);
  });
  nav.appendChild(ul);
  return nav;
};

const PartyDetails = (party) => {
  const article = document.createElement(`article`);
  if (!party) {
    article.textContent = `Select a party to see details.`;
    return article;
  }
  const guests = getPartyGuests(party.id);
  article.innerHTML = `
    <h3>${party.name}</h3>
    <p><strong>ID:</strong> ${party.id}</p>
    <p><strong>Date:</strong> ${party.date}</p>
    <p><strong>Description:</strong> ${party.description}</p>
    <p><strong>Location:</strong> ${party.location}</p>
    <h4>Guests who RSVP'd:</h4>
    <ul>
      ${
        guests.length
          ? guests.map((g) => `<li>${g.name}</li>`).join(``)
          : "<li>No guests have RSVP'd yet.</li>"
      }
    </ul>
  `;
  return article;
};

const render = () => {
  appDiv.innerHTML = `
    <header>
      <h1>Party Planner</h1>
    </header>
    <main>
      <section aria-labelledby="upcoming-parties">
        <h2 id="upcoming-parties">Upcoming Parties</h2>
        <nav id="party-list"></nav>
      </section>
      <section aria-labelledby="party-details">
        <h2 id="party-details">Party Details</h2>
        <article id="party-details-container"></article>
      </section>
      <aside id="error-message" style="color:red;"></aside>
    </main>
  `;
  document
    .getElementById(`party-list`)
    .replaceWith(PartyList(state.partiesList));
  document
    .getElementById(`party-details-container`)
    .replaceWith(PartyDetails(state.selectedParty));
  if (state.error) {
    document.getElementById(`error-message`).textContent = state.error;
  }
};

fetchParties();
