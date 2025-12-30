import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { normalizeText } from '../../shared/utils/normalize';

export const up = async (): Promise<void> => {
  // Nomes brasileiros para clientes
  const clientNames = [
    'Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Juliana Ferreira',
    'Carlos Souza', 'Fernanda Lima', 'Ricardo Alves', 'Patricia Rocha', 'Bruno Martins',
    'Camila Rodrigues', 'Lucas Pereira', 'Amanda Barbosa', 'Rafael Gomes', 'Larissa Araújo',
    'Gabriel Dias', 'Beatriz Ribeiro', 'Thiago Carvalho', 'Isabela Monteiro', 'Felipe Nunes',
    'Mariana Castro', 'Gustavo Ramos', 'Carolina Teixeira', 'Diego Moura', 'Renata Freitas',
    'André Cardoso', 'Vanessa Lopes', 'Rodrigo Moreira', 'Tatiana Correia', 'Marcelo Azevedo',
    'Priscila Machado', 'Leandro Farias', 'Daniela Melo', 'Eduardo Barros', 'Juliana Pires',
    'Henrique Campos', 'Luciana Rezende', 'Vinicius Duarte', 'Sabrina Nascimento', 'Fábio Mendes',
    'Roberta Vieira', 'Paulo Guimarães', 'Adriana Coelho', 'Leonardo Sampaio', 'Cristina Tavares',
    'Marcos Pinheiro', 'Simone Bento', 'Alexandre Queiroz', 'Renata Paiva', 'Sergio Macedo',
    'Leticia Fonseca', 'Igor Cordeiro', 'Monica Aguiar', 'Renato Vasconcelos', 'Eliane Peixoto',
    'Anderson Brito', 'Gisele Medeiros', 'Caio Brandão', 'Viviane Xavier', 'Wagner Leal',
    'Pamela Matos', 'Otavio Rios', 'Cintia Santana', 'Jorge Miranda', 'Sandra Bessa',
    'Fabio Galvão', 'Lilian Falcão', 'Marcelo Teles', 'Regina Dantas', 'Rodolfo Espinosa',
    'Claudia Fontes', 'Elias Barreto', 'Sueli Maciel', 'Nelson Câmara', 'Helena Figueiredo',
    'Mauricio Valente', 'Rosana Pacheco', 'Gilberto Torres', 'Elisa Morais', 'Cesar Lira',
    'Denise Abreu', 'Hugo Salgado', 'Miriam Caldas', 'Arnaldo Bezerra', 'Celia Dutra',
    'Josefa Lins', 'Mario Cezar', 'Neide Siqueira', 'Osvaldo Trindade', 'Rita Fagundes',
    'Ubirajara Neves', 'Zuleika Borges', 'Yara Mota', 'Xavier Couto', 'Waldir Pimenta',
    'Valeria Seabra', 'Tereza Lobato', 'Silvio Nogueira', 'Rosa Maia', 'Quirino Ferraz'
  ];

  // CPFs gerados (apenas para teste, não são CPFs reais válidos)
  const generateCPF = (index: number): string => {
    const base = String(10000000000 + index).padStart(11, '0');
    return base.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Telefones gerados
  const generatePhone = (index: number): string => {
    const ddd = 11 + (index % 89); // DDDs de 11 a 99
    const number = String(900000000 + index).padStart(9, '0');
    return `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
  };

  // Dados de endereço para teste
  const streets = [
    'Rua das Flores', 'Avenida Principal', 'Rua do Comércio', 'Avenida Brasil',
    'Rua São Paulo', 'Avenida Paulista', 'Rua da Paz', 'Avenida Central',
    'Rua Nova', 'Avenida dos Trabalhadores', 'Rua dos Estudantes', 'Avenida das Palmeiras',
    'Rua do Sol', 'Avenida da Liberdade', 'Rua das Acácias', 'Avenida Beira Mar'
  ];
  const neighborhoods = [
    'Centro', 'Jardim América', 'Vila Nova', 'Bela Vista', 'Jardim Primavera',
    'Vila Esperança', 'Industrial', 'Residencial', 'Comercial', 'Alto da Boa Vista'
  ];
  const cities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
    'Salvador', 'Recife', 'Fortaleza', 'Brasília', 'Goiânia'
  ];
  const states = ['SP', 'RJ', 'MG', 'PR', 'RS', 'BA', 'PE', 'CE', 'DF', 'GO'];

  // Criar 100 clientes
  console.log('Criando 100 clientes de teste...');
  const clientStmt = db.prepare(`
    INSERT INTO clients (
      id, name, cpf, phone, address, street, number, neighborhood, city, state, zip_code, 
      email, photo, active, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (let i = 0; i < 100; i++) {
    const clientId = uuidv4();
    const name = clientNames[i % clientNames.length];
    const cpf = generateCPF(i);
    const phone = generatePhone(i);
    const street = streets[i % streets.length];
    const number = String(100 + (i % 900)); // Números de 100 a 999
    const neighborhood = neighborhoods[i % neighborhoods.length];
    const city = cities[i % cities.length];
    const state = states[i % states.length];
    const zipCode = String(10000000 + i).padStart(8, '0'); // CEPs de 10000000 a 10000099
    // Montar endereço completo para o campo address (compatibilidade)
    const address = `${street}, ${number} - ${neighborhood}, ${city}/${state} - CEP: ${zipCode.substring(0, 5)}-${zipCode.substring(5)}`;
    const email = i % 3 === 0 ? `cliente${i}@email.com` : null; // 1/3 com email
    const photo = null; // Sem foto para simplificar

    try {
      clientStmt.run(
        clientId,
        name,
        cpf.replace(/\D/g, ''),
        phone.replace(/\D/g, ''),
        address, // Campo address para compatibilidade
        street,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        email,
        photo,
        1
      );
    } catch (error: any) {
      // Ignora erros de CPF duplicado (pode acontecer se já existirem clientes)
      if (!error.message.includes('UNIQUE constraint failed')) {
        console.error(`Erro ao criar cliente ${i + 1}:`, error.message);
      }
    }
  }
  console.log('✓ 100 clientes criados');

  // Verificar se existem autores e categorias
  const authors = db.prepare('SELECT id, name FROM authors WHERE active = 1 LIMIT 20').all() as Array<{ id: string; name: string }>;
  const categories = db.prepare('SELECT id, name FROM categories WHERE active = 1 LIMIT 10').all() as Array<{ id: string; name: string }>;

  if (authors.length === 0 || categories.length === 0) {
    console.log('⚠ Criando autores e categorias básicos...');
    
    // Criar alguns autores se não existirem
    if (authors.length === 0) {
      const authorNames = [
        'Machado de Assis', 'Clarice Lispector', 'Jorge Amado', 'Carlos Drummond de Andrade',
        'Cecília Meireles', 'Mário de Andrade', 'Monteiro Lobato', 'Lima Barreto',
        'José de Alencar', 'Graciliano Ramos', 'Guimarães Rosa', 'Érico Veríssimo',
        'Lygia Fagundes Telles', 'Rubem Fonseca', 'Paulo Coelho', 'Luis Fernando Verissimo',
        'Fernando Pessoa', 'José Saramago', 'Gabriel García Márquez', 'Mario Vargas Llosa'
      ];
      
      const authorStmt = db.prepare('INSERT INTO authors (id, name, name_normalized, active) VALUES (?, ?, ?, 1)');
      
      for (const authorName of authorNames) {
        const authorId = uuidv4();
        try {
          authorStmt.run(authorId, authorName, normalizeText(authorName));
        } catch (error) {
          // Ignora se já existir
        }
      }
      
      // Recarregar autores
      const newAuthors = db.prepare('SELECT id, name FROM authors WHERE active = 1 LIMIT 20').all() as Array<{ id: string; name: string }>;
      authors.push(...newAuthors);
    }

    // Criar algumas categorias se não existirem
    if (categories.length === 0) {
      const categoryNames = [
        'Romance', 'Ficção Científica', 'Fantasia', 'Mistério', 'Suspense',
        'Biografia', 'História', 'Filosofia', 'Poesia', 'Infantil'
      ];
      
      const categoryStmt = db.prepare('INSERT INTO categories (id, name, name_normalized, active) VALUES (?, ?, ?, 1)');
      
      for (const categoryName of categoryNames) {
        const categoryId = uuidv4();
        try {
          categoryStmt.run(categoryId, categoryName, normalizeText(categoryName));
        } catch (error) {
          // Ignora se já existir
        }
      }
      
      // Recarregar categorias
      const newCategories = db.prepare('SELECT id, name FROM categories WHERE active = 1 LIMIT 10').all() as Array<{ id: string; name: string }>;
      categories.push(...newCategories);
    }
  }

  // Títulos de livros para teste
  const bookTitles = [
    'Dom Casmurro', 'O Cortiço', 'Memórias Póstumas de Brás Cubas', 'O Guarani', 'Iracema',
    'Macunaíma', 'Vidas Secas', 'Grande Sertão: Veredas', 'O Tempo e o Vento', 'A Hora da Estrela',
    'O Quinze', 'Capitães da Areia', 'Gabriela, Cravo e Canela', 'Dona Flor e Seus Dois Maridos',
    'O Alquimista', 'O Diário de Anne Frank', '1984', 'A Revolução dos Bichos', 'O Pequeno Príncipe',
    'O Senhor dos Anéis', 'Harry Potter e a Pedra Filosofal', 'As Crônicas de Nárnia', 'Percy Jackson',
    'A Culpa é das Estrelas', 'Cidades de Papel', 'A Menina que Roubava Livros', 'O Código Da Vinci',
    'Anjos e Demônios', 'Inferno', 'O Símbolo Perdido', 'A Origem', 'O Poder do Hábito',
    'Sapiens', 'Homo Deus', '21 Lições para o Século 21', 'Breve História do Tempo', 'Uma Breve História da Humanidade',
    'O Mundo de Sofia', 'O Nome da Rosa', 'O Enigma de Andrômeda', 'Jurassic Park', 'O Parque dos Dinossauros',
    'A Máquina do Tempo', 'A Guerra dos Mundos', 'Viagem ao Centro da Terra', 'Vinte Mil Léguas Submarinas',
    'Robinson Crusoé', 'Moby Dick', 'Os Três Mosqueteiros', 'O Conde de Monte Cristo', 'Ivanhoé',
    'Orgulho e Preconceito', 'Jane Eyre', 'O Morro dos Ventos Uivantes', 'Drácula', 'Frankenstein',
    'O Médico e o Monstro', 'Sherlock Holmes', 'O Retrato de Dorian Gray', 'Alice no País das Maravilhas',
    'As Aventuras de Tom Sawyer', 'As Aventuras de Huckleberry Finn', 'Moby Dick', 'A Ilha do Tesouro',
    'Peter Pan', 'O Mágico de Oz', 'A Bela e a Fera', 'Cinderela', 'Branca de Neve',
    'A Pequena Sereia', 'Aladim', 'A Bela Adormecida', 'Rapunzel', 'João e Maria',
    'Chapeuzinho Vermelho', 'Os Três Porquinhos', 'Pinóquio', 'Bambi', 'O Livro da Selva',
    'A Dama das Camélias', 'Madame Bovary', 'Os Miseráveis', 'O Corcunda de Notre-Dame', 'A Ópera Fantasma',
    'O Fantasma da Ópera', 'O Homem da Máscara de Ferro', 'Os Três Mosqueteiros', 'O Conde de Monte Cristo',
    'A Ilha Misteriosa', 'Viagem ao Redor do Mundo em 80 Dias', 'Miguel Strogoff', 'Cinco Semanas em um Balão',
    'Da Terra à Lua', 'Ao Redor da Lua', 'A Volta ao Mundo em 80 Dias', 'O Castelo dos Cárpatos',
    'A Jangada', 'A Casa a Vapor', 'O Raio Verde', 'A Ilha com Hélice', 'O Farol do Fim do Mundo'
  ];

  // Origens variadas
  const origins = [
    'Doação de Maria Silva', 'Compra - Livraria Saraiva', 'Doação de João Santos', 'Compra - Amazon',
    'Doação de Ana Costa', 'Compra - Livraria Cultura', 'Doação de Pedro Lima', 'Compra - Submarino',
    'Doação de Juliana Ferreira', 'Compra - Americanas', 'Doação de Carlos Souza', 'Compra - Magazine Luiza',
    'Doação de Fernanda Alves', 'Compra - Mercado Livre', 'Doação de Ricardo Martins', 'Compra - Extra'
  ];

  // Criar 100 livros
  console.log('Criando 100 livros de teste...');
  const bookStmt = db.prepare(`
    INSERT INTO books (
      id, title, author_id, category_id, photo, origin, acquisition_type,
      total_quantity, available_quantity, barcode, inventory_number, edition,
      cover_type, isbn, active, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (let i = 0; i < 100; i++) {
    const bookId = uuidv4();
    const title = bookTitles[i % bookTitles.length] + (i >= bookTitles.length ? ` ${Math.floor(i / bookTitles.length) + 1}` : '');
    const author = authors[i % authors.length];
    const category = categories[i % categories.length];
    const origin = origins[i % origins.length];
    const acquisitionType = i % 2 === 0 ? 'DONATION' : 'PURCHASE';
    const totalQuantity = 1 + (i % 5); // 1 a 5 exemplares
    const availableQuantity = totalQuantity;
    const barcode = i % 3 === 0 ? String(7891234567890 + i) : null; // 1/3 com código de barras
    const inventoryNumber = i % 2 === 0 ? `INV-${String(i + 1).padStart(4, '0')}` : null; // 1/2 com número de inventário
    const edition = i % 4 === 0 ? `${Math.floor(i / 4) + 1}ª edição` : null; // 1/4 com edição
    const coverType = i % 2 === 0 ? 'SOFTCOVER' : 'HARDCOVER';
    const isbn = i % 5 === 0 ? `978-85-${String(1234567 + i).padStart(7, '0')}-${i % 10}` : null; // 1/5 com ISBN
    const photo = null; // Sem foto para simplificar

    try {
      bookStmt.run(
        bookId,
        title,
        author.id,
        category.id,
        photo,
        origin,
        acquisitionType,
        totalQuantity,
        availableQuantity,
        barcode,
        inventoryNumber,
        edition,
        coverType,
        isbn,
        1
      );
    } catch (error: any) {
      console.error(`Erro ao criar livro ${i + 1}:`, error.message);
    }
  }
  console.log('✓ 100 livros criados');
};

export const down = (): void => {
  // Remove os dados de teste (opcional - pode deixar vazio se não quiser reverter)
  // db.prepare('DELETE FROM books WHERE created_at > datetime("now", "-1 day")').run();
  // db.prepare('DELETE FROM clients WHERE created_at > datetime("now", "-1 day")').run();
};

