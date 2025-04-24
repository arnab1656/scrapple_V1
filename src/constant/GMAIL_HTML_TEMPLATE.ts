import { StoredPost } from "@/helpers/storage";

export const HTML_TEMPLATE = (contact: StoredPost) => {
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
<p>Hi ${contact.author.name.split(" ")[0]},</p>

<p>I hope you're doing well!</p>

<p>
  My name is <strong>Arnab Paul</strong>, and I currently have over a year of experience in the tech industry.
  I am proficient in the <strong>MERN stack</strong> and have been working on advanced topics such as
  <strong>React.js, Next.js, Typescript, Prisma ORM, Postgres, Docker, Redis, Kafka, Python</strong>, and have
  hands-on experience with <strong>LLM frameworks</strong>.
</p>

<p>
  I've had the opportunity to work with these technologies on several projects. Currently, I’m working at
  <strong>UNIMAD</strong>, where I have contributed to innovative solutions and expanded my technical skillset.
  I am passionate about developing scalable and efficient web applications and exploring new-age technologies.
</p>

<p>
  I would love to connect and discuss how my experience and skills could be a good fit for any roles you are hiring for.
  Feel free to reach out if you'd like to explore this further.
</p>

<p>
  🔗 <strong>LinkedIn:</strong>
  <a href="https://www.linkedin.com/in/arnabp1/" target="_blank">https://www.linkedin.com/in/arnabp1/</a><br>
  💻 <strong>GitHub:</strong>
  <a href="https://github.com/arnab1656" target="_blank">https://github.com/arnab1656</a>
</p>

<p>Looking forward to connecting!</p>

<p>Best regards,<br><strong>Arnab Paul</strong></p>
<p style="font-size: 12px; color: #999;">email id ${
    contact.email
  } | ${new Date().toLocaleString()}.</p>

</div>`;
};
