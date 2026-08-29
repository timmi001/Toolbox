import './_group.css';

const cards = [
  ['AI Assistant', 'Chat, write, research and brainstorm in one focused workspace.'],
  ['Creator Hub', 'Turn rough ideas into polished content and creative direction.'],
  ['Study Hub', 'Learn faster, practice more and build a better study routine.'],
  ['Career Hub', 'Prepare for your next opportunity with practical AI guidance.'],
  ['Business Hub', 'Plan, organize and grow your business in one focused workspace.'],
];

export function Redesign() {
  return (
    <div className="mockup-home">
      <div className="mockup-frame">
        <div className="mockup-tab">toolbuxx<span style={{ color: '#5577ba' }}>.</span></div>
        <div className="mockup-screen">
          <div className="mockup-intro">
            <div className="eyebrow">Your workspace</div>
            <h1>Good afternoon,</h1>
            <p>What would you like to accomplish today?</p>
          </div>
          <div className="mockup-heading">
            <strong>Your core hubs</strong>
            <span>Focused spaces for creating, learning, planning, and getting work done.</span>
          </div>
          <div className="mockup-cards">
            {cards.map(([title, description]) => (
              <article className="mockup-card" key={title}>
                <h2>{title}</h2>
                <div className="mockup-object" />
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}